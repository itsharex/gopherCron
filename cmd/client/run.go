package client

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/holdno/gopherCron/agent"
	"github.com/holdno/gopherCron/config"
	"github.com/holdno/gopherCron/pkg/warning"
	"github.com/holdno/gopherCron/utils"
)

// 配置文件初始化
func initConf(filePath string) *config.ServiceConfig {
	workerConf := config.InitServiceConfig(filePath)
	return workerConf
}

func Run(opts *SetupOptions) error {
	// 加载配置
	client := agent.NewClient(opts.ConfigPath)

	restart := func() {
		defer func() {
			if r := recover(); r != nil {
				client.Warning(warning.NewSystemWarningData(warning.SystemWarning{
					Endpoint: client.GetIP(),
					Type:     warning.SERVICE_TYPE_AGENT,
					Message:  fmt.Sprintf("agent %s got panic, %v", client.GetIP(), r),
				}))
			}
		}()
		client.Loop()
	}

	go func() {
		for {
			select {
			case <-client.Down():
				return
			default:
				restart()
			}
		}
	}()

	waitingShutdown(client)
	return nil
}

func waitingShutdown(c agent.Client) {
	stopSignalChan := make(chan os.Signal, 1)
	signal.Notify(stopSignalChan, os.Interrupt, os.Kill, syscall.SIGTERM, syscall.SIGINT)

	sig := <-stopSignalChan
	if sig != nil {
		fmt.Println(utils.GetCurrentTimeText(), "got system signal:"+sig.String()+", going to shutdown.")
		c.Close()
	}
}
