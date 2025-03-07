package utils

import (
	"context"
	"crypto/md5"
	"encoding/hex"
	"math/rand"
	"net"
	"os"
	"reflect"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/holdno/gopherCron/common"
	"github.com/holdno/gopherCron/config"
	"github.com/holdno/gopherCron/errors"
	"github.com/spacegrower/watermelon/pkg/safe"

	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/binding"
	"github.com/holdno/snowFlakeByGo"
)

var globalIDWorker *snowFlakeByGo.Worker

// InitIDWorker 初始化ID生成器
func InitIDWorker(cluster int64) {
	var (
		err error
	)
	globalIDWorker, err = snowFlakeByGo.NewWorker(cluster)
	if err != nil {
		panic(err)
	}
}

// GetCurrentTimeText 获取当前时间format
func GetCurrentTimeText() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

// BindArgsWithGin 绑定请求参数
func BindArgsWithGin(c *gin.Context, req interface{}) error {
	err := c.ShouldBindWith(req, binding.Default(c.Request.Method, c.ContentType()))
	if err != nil {
		errObj := errors.ErrInvalidArgument
		errObj.Log = err.Error()
		return errObj
	}
	return nil
}

// GetStrID 生成任务id编号
func GetStrID() string {
	return strconv.FormatInt(globalIDWorker.GetId(), 10)
}

// MakeMD5 MD5加密
func MakeMD5(data string) string {
	h := md5.New()
	h.Write([]byte(data)) // 需要加密的字符串为 123456
	cipherStr := h.Sum(nil)
	return hex.EncodeToString(cipherStr) // 输出加密结果
}

// Random 生成随机数
func Random(min, max int) int {
	if min == max {
		return max
	}
	max = max + 1
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return min + r.Intn(max-min)
}

// RandomStr 随机字符串
func RandomStr(l int) string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	seed := "1234567890QWERTYUIOPASDFGHJKLZXCVBNM"
	str := ""
	length := len(seed)
	for i := 0; i < l; i++ {
		point := r.Intn(length)
		str = str + seed[point:point+1]
	}
	return str
}

// BuildPassword 构建用户密码
func BuildPassword(password, salt string) string {
	return MakeMD5(password + salt)
}

// TernaryOperation 三元操作符
func TernaryOperation(exist bool, res, el interface{}) interface{} {
	if exist {
		return res
	}
	return el
}

// GetContextWithTimeout 返回一个带timeout的context
func GetContextWithTimeout() (context.Context, context.CancelFunc) {
	t := 5
	if config.GetServiceConfig() != nil {
		t = config.GetServiceConfig().Deploy.Timeout
	}
	return context.WithTimeout(context.TODO(), time.Duration(t)*time.Second)
}

// GetBeforeDate 获取n天前的时间
func GetDateFromNow(n int) time.Time {
	timer, _ := time.ParseInLocation("2006-01-02", time.Now().Format("2006-01-02"), time.Local)
	if n == 0 {
		return timer
	}
	return timer.AddDate(0, 0, n)
}

// 获取机器ip
func GetLocalIP() (string, error) {
	var (
		addrs   []net.Addr
		addr    net.Addr
		err     error
		ipNet   *net.IPNet
		isIpNet bool
	)

	if addrs, err = net.InterfaceAddrs(); err != nil {
		return "", err
	}

	// 获取第一个非IO的网卡
	for _, addr = range addrs {
		// ipv4  ipv6
		// 如果能反解成ip地址 则为我们需要的地址
		if ipNet, isIpNet = addr.(*net.IPNet); isIpNet && !ipNet.IP.IsLoopback() {
			// 是ip地址 不是 unix socket地址
			// 继续判断 是ipv4 还是 ipv6
			// 跳过ipv6
			if ipNet.IP.To4() != nil {
				return ipNet.IP.String(), nil
			}
		}
	}
	return "", errors.ErrLocalIPNotFound
}

// StrArrExist 检测string数组中是否包含某个字符串
func StrArrExist(arr []string, check string) bool {
	for _, v := range arr {
		if v == check {
			return true
		}
	}
	return false
}

func GetUserID(c *gin.Context) int64 {
	return c.GetInt64(common.USER_ID)
}

// RetryFunc 带重试的func
func RetryFunc(times int, f func() error) error {
	var (
		reTimes int
		err     error
	)
RETRY:
	if err = f(); err != nil {
		if reTimes == times {
			return err
		}
		time.Sleep(time.Duration(1) * time.Second)
		reTimes++
		goto RETRY
	}
	return nil
}

func DebugMode() bool {
	return os.Getenv("GOPHERENV") == "debug"
}

func ReleaseMode() bool {
	return os.Getenv("GOPHERENV") == "release"
}

func PrintError(err error) string {
	if err == nil || IsNil(err) {
		return ""
	}
	return err.Error()
}

func IsNil(v any) bool {
	rv := reflect.ValueOf(v)
	if rv.Kind() == reflect.Pointer {
		return rv.IsNil()
	}
	return false
}

// 适用于一等多的场景，只要有一处发生异常(信号)即可满足业务需求，其他的信号将被忽略
func NewSignalChannel[T any]() *rChannel[T] {
	return &rChannel[T]{
		channel: make(chan T, 1),
		lock:    sync.RWMutex{},
	}
}

type rChannel[T any] struct {
	isClose bool
	channel chan T
	lock    sync.RWMutex
}

func (r *rChannel[T]) Send(t T) {
	r.lock.RLock()
	defer r.lock.RUnlock()
	if r.isClose {
		return
	}

	select {
	case r.channel <- t:
	default:
		return
	}
}

func (r *rChannel[T]) WaitOne() T {
	defer r.Close()
	return <-r.channel
}

func (r *rChannel[T]) Close() {
	r.lock.Lock()
	defer r.lock.Unlock()
	if r.isClose {
		return
	}
	r.isClose = true
	close(r.channel)
}

type reasonWriter struct {
	s *strings.Builder
}

func (r *reasonWriter) WriteString(s string) {
	if r.s.Len() != 0 {
		r.s.WriteString(",")
	}
	r.s.WriteString(s)
}

func (r *reasonWriter) WriteStringPrefix(s string) {
	if r.s.Len() == 0 {
		r.s.WriteString(s)
		return
	}
	news := strings.Builder{}
	news.WriteString(s)

	old := r.s.String()
	r.s = &news
	r.WriteString(old)
}

func (r *reasonWriter) String() string {
	return r.s.String()
}

func (r *reasonWriter) Len() int {
	return r.s.Len()
}

func NewReasonWriter() *reasonWriter {
	return &reasonWriter{
		s: &strings.Builder{},
	}
}

// CompareVersion 后者大于前者返回true
func CompareVersion(o, n string) bool {
	o = strings.Split(o, "-")[0]
	n = strings.Split(n, "-")[0]

	o = strings.TrimPrefix(o, "v")
	n = strings.TrimPrefix(n, "v")

	parseVersion := func(v string) ([]int, error) {
		var (
			newversions []int
			version     = strings.Split(v, ".")
		)
		for _, v := range version {
			version, err := strconv.Atoi(v)
			if err != nil {
				return nil, err
			}

			newversions = append(newversions, version)
		}
		return newversions, nil
	}

	nvs, err := parseVersion(n)
	if err != nil {
		return false
	}
	ovs, err := parseVersion(o)
	if err != nil {
		return false
	}

	if len(ovs) != 3 || len(nvs) != 3 {
		return false
	}

	if nvs[0] < ovs[0] {
		return false
	} else if nvs[0] > ovs[0] {
		return true
	}

	if nvs[1] < ovs[1] {
		return false
	} else if nvs[1] > ovs[1] {
		return true
	}

	if nvs[2] <= ovs[2] {
		return false
	}
	return true
}

type WaitGroupWithTimeout struct {
	w       *sync.WaitGroup
	pctx    context.Context
	pcancel context.CancelFunc
}

func NewTimeoutWaitGroup(ctx context.Context, cancel context.CancelFunc) *WaitGroupWithTimeout {
	w := &WaitGroupWithTimeout{
		w:       &sync.WaitGroup{},
		pctx:    ctx,
		pcancel: cancel,
	}
	return w
}

func (w *WaitGroupWithTimeout) Add(i int) {
	w.w.Add(i)
}

func (w *WaitGroupWithTimeout) Done() {
	w.w.Done()
}

func (w *WaitGroupWithTimeout) Wait(timeout time.Duration) {
	ctx, cancel := context.WithTimeout(w.pctx, timeout)
	defer cancel()
	closedChan := make(chan struct{})
	go safe.Run(func() {
		w.w.Wait()
		close(closedChan)
	})

	select {
	case <-closedChan:
	case <-ctx.Done():
		// ctx done后会调用 w.pcancel()，调用后，parent ctx会被cancel掉，理论上所有的w.Done()均会被触发
	}
	w.pcancel()
}
