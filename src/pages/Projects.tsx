import { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import type { Epic, Project, Story, WorkspaceData } from '../types';
import { getEpicSummary, getProjectSummary, getStorySummary } from '../utils/projectMetrics';

export function Projects({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'projects' | 'epics' | 'stories', payload: Partial<Project | Epic | Story>) => Promise<string>;
  deleteItem: (collectionName: 'projects' | 'epics' | 'stories', id: string) => Promise<void>;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || '');
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId) || data.projects[0];
  const epics = data.epics.filter((epic) => epic.projectId === selectedProject?.id);
  const selectedProjectSummary = selectedProject ? getProjectSummary(data, selectedProject.id) : null;
  const directProjectTasks = selectedProject
    ? data.tasks.filter((task) => task.projectId === selectedProject.id && !task.epicId)
    : [];

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = await saveItem('projects', {
      name: String(formData.get('name') || ''),
      description: String(formData.get('description') || ''),
      goal: String(formData.get('goal') || ''),
      owner: String(formData.get('owner') || ''),
      status: '尚未開始',
    });
    setSelectedProjectId(id);
    event.currentTarget.reset();
  };

  const handleEpicSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProject) return;
    const formData = new FormData(event.currentTarget);
    await saveItem('epics', {
      projectId: selectedProject.id,
      title: String(formData.get('title') || ''),
      goal: String(formData.get('goal') || ''),
      status: '尚未開始',
    });
    event.currentTarget.reset();
  };

  const handleStorySubmit = async (event: React.FormEvent<HTMLFormElement>, epicId: string) => {
    event.preventDefault();
    if (!selectedProject) return;
    const formData = new FormData(event.currentTarget);
    await saveItem('stories', {
      projectId: selectedProject.id,
      epicId,
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      value: String(formData.get('value') || ''),
    });
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Projects</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">專案結構</h2>
        <p className="mt-2 text-slate-500">以 Project / Epic / Story / Task 結構管理不同專案；Project 狀態與進度會依底下 Task 自動推算。</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card xl:col-span-1">
          <h3 className="section-title">Project List</h3>
          <div className="mt-4 space-y-3">
            {data.projects.map((project) => {
              const summary = getProjectSummary(data, project.id);
              return (
                <button
                  key={project.id}
                  className={`w-full rounded-2xl border p-4 text-left transition ${selectedProject?.id === project.id ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:bg-slate-50'}`}
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{project.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.goal}</p>
                      <p className="mt-2 text-xs text-slate-500">{summary.completion.percent}%・{summary.completion.completed}/{summary.completion.total} 任務完成</p>
                    </div>
                    <StatusBadge status={summary.status} />
                  </div>
                </button>
              );
            })}
          </div>

          <form className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4" onSubmit={handleProjectSubmit}>
            <p className="text-sm font-semibold text-slate-800">新增 Project</p>
            <input className="input" name="name" placeholder="專案名稱" required />
            <input className="input" name="goal" placeholder="專案目標" />
            <input className="input" name="owner" placeholder="Owner" />
            <textarea className="input min-h-20" name="description" placeholder="專案說明" />
            <button className="btn-primary w-full" type="submit">新增專案</button>
          </form>
        </section>

        <section className="space-y-4 xl:col-span-2">
          {selectedProject && selectedProjectSummary && (
            <div className="card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-semibold text-slate-950">{selectedProject.name}</h3>
                    <StatusBadge status={selectedProjectSummary.status} />
                  </div>
                  <p className="mt-2 text-slate-500">{selectedProject.description}</p>
                  <p className="mt-3 text-sm text-slate-700"><span className="font-medium">目標：</span>{selectedProject.goal}</p>
                  <p className="mt-1 text-sm text-slate-700"><span className="font-medium">利害關係人：</span>{selectedProject.stakeholders || '未填'}</p>
                  <p className="mt-3 text-sm text-slate-700">
                    <span className="font-medium">自動進度：</span>
                    {selectedProjectSummary.completion.completed}/{selectedProjectSummary.completion.total} 完成（{selectedProjectSummary.completion.percent}%）
                    {selectedProjectSummary.attention.coordination > 0 ? `・需協調 ${selectedProjectSummary.attention.coordination}` : ''}
                    {selectedProjectSummary.attention.review > 0 ? `・待確認 ${selectedProjectSummary.attention.review}` : ''}
                  </p>
                </div>
                <button className="btn-secondary text-rose-600" onClick={() => deleteItem('projects', selectedProject.id)}>刪除 Project</button>
              </div>
            </div>
          )}

          {selectedProject && directProjectTasks.length > 0 && (
            <div className="card">
              <h3 className="section-title">未歸入 Epic 的任務</h3>
              <p className="mt-2 text-sm text-slate-500">這些任務目前只掛在 Project 下方，可之後再補 Epic / Story。</p>
              <div className="mt-4 space-y-2">
                {directProjectTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between gap-3 rounded-2xl bg-slate-50 p-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.assignee || '未填負責人'}・{task.dueDate || '未設定日期'}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedProject && (
            <form className="card grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleEpicSubmit}>
              <input className="input" name="title" placeholder="新增 Epic 名稱" required />
              <input className="input" name="goal" placeholder="Epic 目標" />
              <button className="btn-primary" type="submit">新增 Epic</button>
            </form>
          )}

          {epics.map((epic) => {
            const stories = data.stories.filter((story) => story.epicId === epic.id);
            const epicSummary = getEpicSummary(data, epic.id);
            return (
              <div key={epic.id} className="card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-semibold text-slate-950">{epic.title}</h4>
                      <StatusBadge status={epicSummary.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{epic.goal}</p>
                    <p className="mt-2 text-xs text-slate-500">Story：{stories.length}・Task：{epicSummary.completion.total}・完成率：{epicSummary.completion.percent}%</p>
                  </div>
                  <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('epics', epic.id)}>刪除</button>
                </div>

                <div className="mt-4 space-y-3">
                  {stories.map((story) => {
                    const storySummary = getStorySummary(data, story.id);
                    return (
                      <div key={story.id} className="rounded-2xl border border-slate-100 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium text-slate-950">{story.title}</p>
                              <StatusBadge status={storySummary.status} />
                            </div>
                            <p className="mt-1 text-sm text-slate-500">{story.description}</p>
                            <p className="mt-2 text-xs text-slate-500">Task：{storySummary.completion.total}・完成率：{storySummary.completion.percent}%</p>
                          </div>
                          <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('stories', story.id)}>刪除</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 md:grid-cols-3" onSubmit={(event) => handleStorySubmit(event, epic.id)}>
                  <input className="input" name="title" placeholder="新增 Story 名稱" required />
                  <input className="input" name="description" placeholder="需求 / 交付描述" />
                  <input className="input" name="value" placeholder="價值 / 目的" />
                  <button className="btn-secondary md:col-span-3" type="submit">新增 Story</button>
                </form>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
