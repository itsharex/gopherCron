package daemon

import (
	"fmt"
	"sync"

	"github.com/holdno/gopherCron/config"
	"github.com/spacegrower/watermelon/infra/wlog"
	"go.uber.org/zap"
)

type ProjectDaemon struct {
	projects []int64
	m        sync.Map
	logger   wlog.Logger
}

type daemonSignal struct {
	projectID  int64
	removeChan chan struct{}
	isRemove   bool
}

func NewProjectDaemon(ids []int64, logger wlog.Logger) *ProjectDaemon {
	pd := &ProjectDaemon{
		projects: ids,
		logger:   logger,
	}

	for _, v := range pd.projects {
		pd.addProject(v)
	}

	return pd
}

func (d *ProjectDaemon) DiffAndAddProjects(ids []config.ProjectAuth) (add, remove []int64) {
	var (
		existPM = make(map[int64]bool)
		newPM   = make(map[int64]bool)
	)

	for _, v := range ids {
		newPM[v.ProjectID] = true
	}

	for _, v := range d.projects {
		if !newPM[v] {
			remove = append(remove, v)
			d.RemoveProject(v)
		}
		existPM[v] = true
	}

	for _, v := range ids {
		if !existPM[v.ProjectID] {
			add = append(add, v.ProjectID)
		}
	}

	for _, v := range add {
		d.addProject(v)
	}

	d.refreshProjects()
	return
}

func (d *ProjectDaemon) WaitRemoveSignal(id int64) chan struct{} {
	ds := d.getProjectDaemon(id)
	if ds == nil {
		return nil
	}

	return ds.removeChan
}

func (d *ProjectDaemon) addProject(id int64) {
	d.m.Store(id, &daemonSignal{
		projectID:  id,
		removeChan: make(chan struct{}),
		isRemove:   false,
	})
}

func (d *ProjectDaemon) getProjectDaemon(id int64) *daemonSignal {
	v, _ := d.m.Load(id)
	if v == nil {
		return nil
	}
	return v.(*daemonSignal)
}

func (d *ProjectDaemon) refreshProjects() {
	var pids []int64
	d.m.Range(func(key, value interface{}) bool {
		id := key.(int64)
		pids = append(pids, id)
		return true
	})

	d.projects = pids
}

func (d *ProjectDaemon) Close() {
	fmt.Println("project daemon is about to close")
	d.m.Range(func(key, value interface{}) bool {
		projectID := key.(int64)
		d.RemoveProject(projectID)
		fmt.Printf("project %d is down\n", projectID)
		return true
	})
	d.projects = []int64{}
	fmt.Println("project daemon is down")
}

func (d *ProjectDaemon) RemoveProject(id int64) {

	pd := d.getProjectDaemon(id)
	if pd == nil {
		return
	}

	if pd.isRemove {
		d.m.Delete(id)
		return
	}

	pd.isRemove = true
	close(pd.removeChan)
	d.m.Delete(id)

	d.logger.Debug("remove project", zap.Int64("project_id", id))
}
