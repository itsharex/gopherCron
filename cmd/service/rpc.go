package service

import (
	"context"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/holdno/gopherCron/app"
	"github.com/holdno/gopherCron/cmd/service/middleware"
	"github.com/holdno/gopherCron/common"
	"github.com/holdno/gopherCron/errors"
	"github.com/holdno/gopherCron/jwt"
	"github.com/holdno/gopherCron/pkg/cronpb"
	"github.com/holdno/gopherCron/pkg/etcd"
	"github.com/holdno/gopherCron/pkg/infra"
	"github.com/holdno/gopherCron/utils"

	"github.com/spacegrower/watermelon/infra/register"
	wutils "github.com/spacegrower/watermelon/infra/utils"
	"github.com/spacegrower/watermelon/infra/wlog"
	"github.com/spacegrower/watermelon/pkg/safe"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type cronRpc struct {
	app app.App
	cronpb.UnimplementedCenterServer
	registerMetricsAdd      func(add float64, labels ...string)
	eventsMetricsInc        func()
	getCurrentRegisterAddrs func() []*net.TCPAddr
}

func (s *cronRpc) RemoveStream(ctx context.Context, req *cronpb.RemoveStreamRequest) (*cronpb.Result, error) {
	stream := s.app.StreamManager().GetStreamsByHost(req.Client)
	currentRegistry := false
	if stream != nil {
		currentRegistry = true
		stream.Cancel()
	} else {
		streamV2 := s.app.StreamManagerV2().GetStreamsByHost(req.Client)
		if streamV2 != nil {
			currentRegistry = true
			streamV2.Cancel()
		}
	}
	return &cronpb.Result{
		Result:  currentRegistry,
		Message: "ok",
	}, nil
}

func (s *cronRpc) TryLock(req cronpb.Center_TryLockServer) error {
	authenticator := jwt.GetProjectAuthenticator(req.Context())
	agentIP, exist := middleware.GetAgentIPFromContext(req.Context())
	if !exist {
		return status.Error(codes.PermissionDenied, codes.PermissionDenied.String())
	}
	var (
		locker    *etcd.Locker
		heartbeat = time.NewTicker(time.Second * 5)
	)
	defer func() {
		heartbeat.Stop()
		if locker != nil {
			locker.Unlock()
		}
	}()
	for {
		select {
		case <-req.Context().Done():
			return req.Context().Err()
		case <-heartbeat.C:
			if err := req.Send(&cronpb.TryLockReply{
				Result:  true,
				Message: "heartbeat",
			}); err != nil {
				return err
			}
		default:
			task, err := req.Recv()
			if err != nil || task == nil {
				return err
			}
			if authenticator != nil && !authenticator.Allow(task.ProjectId) {
				return status.Error(codes.Unauthenticated, codes.Unauthenticated.String())
			}
			locker = s.app.GetTaskLocker(&common.TaskInfo{TaskID: task.TaskId, ProjectID: task.ProjectId})
			if err = locker.TryLockWithOwner(agentIP); err != nil {
				return status.Error(codes.Aborted, err.Error())
			}

			// 加锁成功后获取任务运行中状态的key是否存在，若存在则说明之前执行该任务的机器网络中断 / 宕机
			runningInfo, err := s.app.CheckTaskIsRunning(task.ProjectId, task.TaskId)
			if err != nil {
				return err
			}

			pass := len(runningInfo) == 0
			if !pass {
				for _, info := range runningInfo {
					if info.AgentIP == agentIP {
						pass = true
						break
					}
				}
			}

			if pass {
				return req.Send(&cronpb.TryLockReply{
					Result:  true,
					Message: "ok",
				})
			}
			return status.Error(codes.Aborted, "任务运行中")
		}
	}
}

func (s *cronRpc) StatusReporter(ctx context.Context, req *cronpb.ScheduleReply) (*cronpb.Result, error) {
	author := jwt.GetProjectAuthenticator(ctx)
	if author != nil && !author.Allow(req.ProjectId) {
		return nil, status.Error(codes.Unauthenticated, codes.Unauthenticated.String())
	}
	agentIP, _ := middleware.GetAgentIP(ctx)
	switch req.Event.Type {
	case common.TASK_STATUS_RUNNING_V2:
		var result common.TaskExecutingInfo
		if err := json.Unmarshal(req.Event.Value, &result); err != nil {
			return nil, err
		}
		if err := s.app.SetTaskRunning(agentIP, &result); err != nil {
			var workflowID int64
			if result.Task.FlowInfo != nil {
				workflowID = result.Task.FlowInfo.WorkflowID
			}
			wlog.Error("failed to set task running status", zap.Error(err), zap.String("task_id", result.Task.TaskID),
				zap.Int64("project_id", result.Task.ProjectID), zap.String("tmp_id", result.TmpID),
				zap.Int64("workflow_id", workflowID))
			return nil, err
		}
	case common.TASK_STATUS_FINISHED_V2:
		var result common.TaskFinishedV2
		if err := json.Unmarshal(req.Event.Value, &result); err != nil {
			return nil, err
		}

		version, exist := middleware.GetAgentVersion(ctx)
		if exist && utils.CompareVersion("v2.1.9999", version) {
			s.app.SaveTaskLog(agentIP, result)
		}

		if err := s.app.HandlerTaskFinished(agentIP, &result); err != nil && err != app.ErrWorkflowInProcess {
			wlog.Error("failed to set task finished status", zap.Error(err), zap.String("task_id", result.TaskID),
				zap.Int64("project_id", result.ProjectID), zap.String("tmp_id", result.TmpID),
				zap.Int64("workflow_id", result.WorkflowID))
			return nil, err
		}
	}
	return &cronpb.Result{
		Result:  true,
		Message: "ok",
	}, nil
}

func (s *cronRpc) SendEvent(ctx context.Context, req *cronpb.SendEventRequest) (*cronpb.ClientEvent, error) {
	if req.ProjectId == 0 {
		// got event for center
		if err := s.app.HandleCenterEvent(req.Event); err != nil {
			return nil, status.Error(codes.Internal, err.Error())
		}
	} else {
		if req.Agent != "" {
			stream := s.app.StreamManagerV2().GetStreamsByHost(req.Agent)
			if stream == nil {
				return nil, status.Error(codes.NotFound, fmt.Sprintf("stream not found, service ip: %s, agent: %s", s.app.GetIP(), req.Agent))
			}
			resp, err := s.app.StreamManagerV2().SendEventWaitResponse(ctx, stream, req.Event)
			if err != nil {
				stream.Cancel()
				return nil, errors.NewError(http.StatusInternalServerError, fmt.Sprintf("stream 下发任务操作失败, 主动断开agent链接, %s:%d, %v", stream.Host, stream.Port, err))
			}
			return resp, nil
		}
		for _, v := range s.app.StreamManager().GetStreams(req.ProjectId, cronpb.Agent_ServiceDesc.ServiceName) {
			if err := v.Send(req.Event.GetRegisterReply()); err != nil {
				v.Cancel()
				return nil, errors.NewError(http.StatusInternalServerError, fmt.Sprintf("下发任务操作失败, 主动断开agent链接, %s:%d, %v", v.Host, v.Port, err))
			}
		}
		for _, v := range s.app.StreamManagerV2().GetStreams(req.ProjectId, cronpb.Agent_ServiceDesc.ServiceName) {
			_, err := s.app.StreamManagerV2().SendEventWaitResponse(ctx, v, req.Event)
			if err != nil {
				v.Cancel()
				return nil, errors.NewError(http.StatusInternalServerError, fmt.Sprintf("stream 下发任务操作失败, 主动断开agent链接, %s:%d, %v", v.Host, v.Port, err))
			}
		}
	}
	return &cronpb.ClientEvent{
		Id: req.Event.Id,
	}, nil
}

func (s *cronRpc) Auth(ctx context.Context, req *cronpb.AuthReq) (*cronpb.AuthReply, error) {
	var pids []int64
	for pid, token := range req.Kvs {
		pids = append(pids, pid)
		project, err := s.app.GetProject(pid)
		if err != nil {
			return nil, status.Error(codes.Internal, err.Error())
		}

		if project.Token != token {
			return nil, status.Error(codes.PermissionDenied, codes.PermissionDenied.String())
		}
	}

	claims := jwt.AgentTokenClaims{
		Biz:        jwt.DefaultBIZ,
		ProjectIDs: pids,
		Exp:        int64(time.Now().Add(time.Duration(s.app.GetConfig().JWT.Exp) * time.Hour).Unix()),
		Iat:        time.Now().Unix(),
	}
	token, err := jwt.BuildAgentJWT(claims, []byte(s.app.GetConfig().JWT.PrivateKey))
	if err != nil {
		return nil, err
	}
	return &cronpb.AuthReply{
		Jwt:        token,
		ExpireTime: claims.Exp,
	}, nil
}

func (s *cronRpc) RegisterAgent(req cronpb.Center_RegisterAgentServer) error {
	author := jwt.GetProjectAuthenticator(req.Context())
	newRegister := make(chan *cronpb.RegisterAgentReq)
	go safe.Run(func() {
		for {
			select {
			case <-req.Context().Done():
				return
			default:
				info, err := req.Recv()
				if err != nil {
					close(newRegister)
					return
				}
				newRegister <- info
			}
		}
	})

	agentIP, _ := middleware.GetAgentIP(req.Context())

	ctx, cancel := context.WithCancel(req.Context())
	defer cancel()
	r := infra.MustSetupEtcdRegister()
	var registerStream []infra.NodeMeta
	defer func() {
		s.registerMetricsAdd(-1, agentIP)
		r.DeRegister()
		for _, meta := range registerStream {
			s.app.StreamManager().RemoveStream(meta)
		}
	}()
Here:
	for {
		select {
		case multiService := <-newRegister:
			if multiService == nil {
				break Here
			}

			var registerStreamOnce []infra.NodeMeta

			for _, info := range multiService.Agents {
				var methods []register.GrpcMethodInfo
				for _, v := range info.Methods {
					methods = append(methods, register.GrpcMethodInfo{
						Name:           v.Name,
						IsClientStream: v.IsClientStream,
						IsServerStream: v.IsServerStream,
					})
				}

				for _, v := range info.Systems {
					if author != nil && !author.Allow(v) {
						return status.Error(codes.Unauthenticated, fmt.Sprintf("registry: project id %d is unauthenticated, register failure", v))
					}
					meta := infra.NodeMeta{
						NodeMeta: register.NodeMeta{
							ServiceName: info.ServiceName,
							GrpcMethods: methods,
							Host:        info.Host,
							Port:        int(info.Port),
							Runtime:     info.Runtime,
							Version:     info.Version,
						},
						OrgID:        info.OrgID,
						Region:       info.Region,
						Weight:       info.Weight,
						System:       v,
						Tags:         info.Tags,
						RegisterTime: time.Now().UnixNano(),
					}
					if err := r.Append(meta); err != nil {
						return err
					}
					registerStreamOnce = append(registerStreamOnce, meta)
				}
			}

			s.registerMetricsAdd(1, agentIP)
			if err := r.Register(); err != nil {
				wlog.Error("failed to register service", zap.Error(err), zap.String("method", "Register"))
				s.app.Metrics().CustomInc("register_error", s.app.GetIP(), err.Error())
				return status.Error(codes.Internal, "failed to register service")
			}

			for _, meta := range registerStreamOnce {
				s.app.StreamManager().SaveStream(meta, req, cancel)
			}

			registerStream = append(registerStream, registerStreamOnce...)

			for _, info := range multiService.Agents {
				for _, v := range info.Systems {
					// Dispatch 依赖 gRPC stream, 所以需要先 SaveStream 再 DispatchAgentJob
					if err := s.app.DispatchAgentJob(v); err != nil {
						return err
					}
				}
			}

			go func() {
				ticker := time.NewTicker(time.Second * 10)
				defer ticker.Stop()
				for {
					select {
					case <-ctx.Done():
						return
					case <-ticker.C:
						s.eventsMetricsInc()
						if err := req.Send(&cronpb.Event{
							Type:      "heartbeat",
							Version:   common.VERSION_TYPE_V1,
							Value:     []byte("heartbeat"),
							EventTime: time.Now().Unix(),
						}); err != nil {
							cancel()
							return
						}
					}
				}
			}()
		case <-ctx.Done():
			break Here
		}
	}

	return nil
}

func (s *cronRpc) RegisterAgentV2(req cronpb.Center_RegisterAgentV2Server) error {
	author := jwt.GetProjectAuthenticator(req.Context())
	newRegisterInfo := make(chan *cronpb.RegisterInfo)
	go safe.Run(func() {
		for {
			select {
			case <-req.Context().Done():
				return
			default:
				info, err := req.Recv()
				if err != nil {
					close(newRegisterInfo)
					return
				}

				if info.Type == cronpb.EventType_EVENT_REGISTER_REQUEST {
					newRegisterInfo <- info.GetRegisterInfo()
				} else {
					s.app.StreamManagerV2().RecvStreamResponse(info)
				}
			}
		}
	})

	agentIP, _ := middleware.GetAgentIP(req.Context())
	mustGetHostIP := func() string {
		ip, _ := wutils.GetHostIP()
		return ip
	}
	currentServiceAddr := strings.ReplaceAll(s.getCurrentRegisterAddrs()[0].String(), "[::]", mustGetHostIP())

	ctx, cancel := context.WithCancel(req.Context())
	defer cancel()
	r := infra.MustSetupEtcdRegister()
	var registerStream []infra.NodeMeta
	defer func() {
		s.registerMetricsAdd(-1, agentIP)
		r.DeRegister()
		for _, meta := range registerStream {
			s.app.StreamManagerV2().RemoveStream(meta)
		}
	}()

	heartbeatOnce := sync.Once{}
Here:
	for {
		select {
		case multiService := <-newRegisterInfo:
			if multiService == nil {
				break Here
			}

			var registerStreamOnce []infra.NodeMeta

			for _, info := range multiService.Agents {
				var methods []register.GrpcMethodInfo
				for _, v := range info.Methods {
					methods = append(methods, register.GrpcMethodInfo{
						Name:           v.Name,
						IsClientStream: v.IsClientStream,
						IsServerStream: v.IsServerStream,
					})
				}

				for _, v := range info.Systems {
					if author != nil && !author.Allow(v) {
						return status.Error(codes.Unauthenticated, fmt.Sprintf("registry: project id %d is unauthenticated, register failure", v))
					}
					meta := infra.NodeMeta{
						NodeMeta: register.NodeMeta{
							ServiceName: info.ServiceName,
							GrpcMethods: methods,
							Host:        info.Host,
							Port:        int(info.Port),
							Runtime:     info.Runtime,
							Version:     info.Version,
						},
						CenterServiceEndpoint: currentServiceAddr,
						CenterServiceRegion:   s.app.GetConfig().Micro.Region,
						OrgID:                 info.OrgID,
						Region:                info.Region,
						Weight:                info.Weight,
						System:                v,
						Tags:                  info.Tags,
						RegisterTime:          time.Now().UnixNano(),
					}
					if err := r.Append(meta); err != nil {
						return err
					}
					registerStreamOnce = append(registerStreamOnce, meta)
				}
			}
			if err := r.Register(); err != nil {
				wlog.Error("failed to register service", zap.Error(err), zap.String("method", "Register"))
				s.app.Metrics().CustomInc("register_error", s.app.GetIP(), err.Error())
				return status.Error(codes.Internal, "failed to register service")
			}
			s.registerMetricsAdd(1, agentIP)

			for _, meta := range registerStreamOnce {
				s.app.StreamManagerV2().SaveStream(meta, req, cancel)
			}

			registerStream = append(registerStream, registerStreamOnce...)

			for _, info := range multiService.Agents {
				for _, v := range info.Systems {
					// Dispatch 依赖 gRPC stream, 所以需要先 SaveStream 再 DispatchAgentJob
					if err := s.app.DispatchAgentJob(v); err != nil {
						return err
					}
				}
			}

			heartbeatOnce.Do(func() { // 一个stream仅需要建立一个长连接
				go func() {
					ticker := time.NewTicker(time.Second * 10)
					defer ticker.Stop()
					for {
						select {
						case <-ctx.Done():
							return
						case <-ticker.C:
							s.eventsMetricsInc()
							if err := req.Send(&cronpb.ServiceEvent{
								Id:        utils.GetStrID(),
								Type:      cronpb.EventType_EVENT_REGISTER_HEARTBEAT_PING,
								EventTime: time.Now().Unix(),
							}); err != nil {
								cancel()
								return
							}
						}
					}
				}()
			})

		case <-ctx.Done():
			break Here
		}
	}

	return nil
}
