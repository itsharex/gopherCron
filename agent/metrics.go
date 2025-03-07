package agent

import (
	"strconv"

	"github.com/holdno/gopherCron/pkg/metrics"

	"github.com/prometheus/client_golang/prometheus"
)

type Metrics struct {
	provider    *metrics.Metrics
	task        *prometheus.GaugeVec
	systemError *prometheus.CounterVec
	taskRuntime *prometheus.HistogramVec
}

func NewMonitor(instance string) *Metrics {
	m := &Metrics{
		provider: metrics.NewMetrics("agent", instance),
	}

	m.task = m.provider.NewGaugeVec("task_counter", nil)
	m.systemError = m.provider.NewCounterVec("system_error", []string{"reason"})
	m.taskRuntime = m.provider.NewHistogramVec("task_runtime", []string{"project_id", "task_id", "task_name"})
	return m
}

func (s *Metrics) SetJobCount(count int) {
	s.task.WithLabelValues().Set(float64(count))
}

func (s *Metrics) SystemErrInc(reason string) {
	s.systemError.WithLabelValues(reason).Inc()
}

func (s *Metrics) TaskRuntimeRecord(projectID int64, taskID, taskName string) *prometheus.Timer {
	return prometheus.NewTimer(s.taskRuntime.WithLabelValues(strconv.FormatInt(projectID, 10), taskID, taskName))
}
