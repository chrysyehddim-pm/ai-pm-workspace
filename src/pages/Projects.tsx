import { useEffect, useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import type { Epic, Project, Story, WorkspaceData } from '../types';
import { getEpicSummary, getProjectSummary, getStorySummary } from '../utils/projectMetrics';

export function Projects({
  data,
  saveItem,
  deleteItem,
  selectedProjectId: externalSelectedProjectId,
  onClearSelectedProject,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'projects' | 'epics' | 'stories', payload: Partial<Project | Epic | Story>) => Promise<string>;
  deleteItem: (collectionName: 'projects' | 'epics' | 'stories', id: string) => Promise<void>;
  selectedProjectId?: string | null;
  onClearSelectedProject?: () => void;
}) {
  const [selectedProjectId, setSelectedProjectId] = useState(data.projects[0]?.id || '');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingEpic, setEditingEpic] = useState<Epic | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);


  useEffect(() => {
    if (externalSelectedProjectId) {
      setSelectedProjectId(externalSelectedProjectId);
      onClearSelectedProject?.();
    }
  }, [externalSelectedProjectId, onClearSelectedProject]);
  const selectedProject = data.projects.find((project) => project.id === selectedProjectId) || data.projects[0];
  const epics = data.epics.filter((epic) => epic.projectId === selectedProject?.id);
  const selectedProjectSummary = selectedProject ? getProjectSummary(data, selectedProject.id) : null;
  const directProjectTasks = selectedProject
    ? data.tasks.filter((task) => task.projectId === selectedProject.id && !task.epicId)
    : [];

  const handleProjectSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Partial<Project> = {
      ...(editingProject || {}),
      name: String(formData.get('name') || ''),
      description: String(formData.get('description') || ''),
      goal: String(formData.get('goal') || ''),
      owner: String(formData.get('owner') || ''),
      stakeholders: String(formData.get('stakeholders') || ''),
      startDate: String(formData.get('startDate') || ''),
      targetDate: String(formData.get('targetDate') || ''),
      status: editingProject?.status || '尚未開始',
    };
    const id = await saveItem('projects', payload);
    setSelectedProjectId(id);
    setEditingProject(null);
    form.reset();
  };

  const handleEpicSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProject) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    await saveItem('epics', {
      ...(editingEpic || {}),
      projectId: selectedProject.id,
      title: String(formData.get('title') || ''),
      goal: String(formData.get('goal') || ''),
      status: editingEpic?.status || '尚未開始',
    });
    setEditingEpic(null);
    form.reset();
  };

  const handleStorySubmit = async (event: React.FormEvent<HTMLFormElement>, epicId: string) => {
    event.preventDefault();
    if (!selectedProject) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    await saveItem('stories', {
      ...(editingStory || {}),
      projectId: selectedProject.id,
      epicId,
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      value: String(formData.get('value') || ''),
    });
    setEditingStory(null);
    form.reset();
  };

  const projectFormKey = editingProject?.id || 'new-project';
  const epicFormKey = editingEpic?.id || 'new-epic';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">專案管理</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">專案結構</h2>
        <p className="mt-2 text-slate-500">以 Project / Epic / Story / Task 結構管理不同專案；Project 狀態與進度會依底下 Task 自動推算。</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card xl:col-span-1">
          <h3 className="section-title">專案清單</h3>
          <div className="mt-4 space-y-3">
            {data.projects.length === 0 && <p className="muted">目前尚無專案，請先新增 Project。</p>}
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
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.goal || '未填專案目標'}</p>
                      <p className="mt-2 text-xs text-slate-500">{summary.completion.percent}%・{summary.completion.completed}/{summary.completion.total} 任務完成</p>
                    </div>
                    <StatusBadge status={summary.status} />
                  </div>
                </button>
              );
            })}
          </div>

          <form key={projectFormKey} className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4" onSubmit={handleProjectSubmit}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-800">{editingProject ? '編輯 Project' : '新增 Project'}</p>
              {editingProject && <button type="button" className="text-xs font-medium text-slate-500" onClick={() => setEditingProject(null)}>取消</button>}
            </div>
            <input className="input" name="name" placeholder="專案名稱" required defaultValue={editingProject?.name || ''} />
            <input className="input" name="goal" placeholder="專案目標" defaultValue={editingProject?.goal || ''} />
            <input className="input" name="owner" placeholder="Owner" defaultValue={editingProject?.owner || ''} />
            <input className="input" name="stakeholders" placeholder="利害關係人" defaultValue={editingProject?.stakeholders || ''} />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" name="startDate" type="date" defaultValue={editingProject?.startDate || ''} />
              <input className="input" name="targetDate" type="date" defaultValue={editingProject?.targetDate || ''} />
            </div>
            <textarea className="input min-h-20" name="description" placeholder="專案說明" defaultValue={editingProject?.description || ''} />
            <button className="btn-primary w-full" type="submit">{editingProject ? '儲存 Project' : '新增專案'}</button>
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
                  <p className="mt-2 text-slate-500">{selectedProject.description || '未填專案說明'}</p>
                  <p className="mt-3 text-sm text-slate-700"><span className="font-medium">目標：</span>{selectedProject.goal || '未填'}</p>
                  <p className="mt-1 text-sm text-slate-700"><span className="font-medium">利害關係人：</span>{selectedProject.stakeholders || '未填'}</p>
                  <p className="mt-3 text-sm text-slate-700">
                    <span className="font-medium">自動進度：</span>
                    {selectedProjectSummary.completion.completed}/{selectedProjectSummary.completion.total} 完成（{selectedProjectSummary.completion.percent}%）
                    {selectedProjectSummary.attention.coordination > 0 ? `・需協調 ${selectedProjectSummary.attention.coordination}` : ''}
                    {selectedProjectSummary.attention.review > 0 ? `・待確認 ${selectedProjectSummary.attention.review}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn-secondary" onClick={() => setEditingProject(selectedProject)}>編輯</button>
                  <button className="btn-secondary text-rose-600" onClick={() => deleteItem('projects', selectedProject.id)}>刪除</button>
                </div>
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
            <form key={epicFormKey} className="card grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={handleEpicSubmit}>
              <input className="input" name="title" placeholder="Epic 名稱" required defaultValue={editingEpic?.title || ''} />
              <input className="input" name="goal" placeholder="Epic 目標" defaultValue={editingEpic?.goal || ''} />
              <button className="btn-primary" type="submit">{editingEpic ? '儲存 Epic' : '新增 Epic'}</button>
              {editingEpic && <button type="button" className="btn-secondary" onClick={() => setEditingEpic(null)}>取消</button>}
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
                    <p className="mt-1 text-sm text-slate-500">{epic.goal || '未填 Epic 目標'}</p>
                    <p className="mt-2 text-xs text-slate-500">Story：{stories.length}・Task：{epicSummary.completion.total}・完成率：{epicSummary.completion.percent}%</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-sm font-medium text-slate-700" onClick={() => setEditingEpic(epic)}>編輯</button>
                    <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('epics', epic.id)}>刪除</button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {stories.map((story) => {
                    const storySummary = getStorySummary(data, story.id);
                    const isEditing = editingStory?.id === story.id;
                    return (
                      <div key={story.id} className="rounded-2xl border border-slate-100 p-4">
                        {isEditing ? (
                          <StoryForm
                            story={story}
                            onSubmit={(event) => handleStorySubmit(event, epic.id)}
                            onCancel={() => setEditingStory(null)}
                          />
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium text-slate-950">{story.title}</p>
                                <StatusBadge status={storySummary.status} />
                              </div>
                              <p className="mt-1 text-sm text-slate-500">{story.description || '未填需求描述'}</p>
                              <p className="mt-2 text-xs text-slate-500">Task：{storySummary.completion.total}・完成率：{storySummary.completion.percent}%</p>
                            </div>
                            <div className="flex gap-2">
                              <button className="text-sm font-medium text-slate-700" onClick={() => setEditingStory(story)}>編輯</button>
                              <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('stories', story.id)}>刪除</button>
                            </div>
                          </div>
                        )}
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

function StoryForm({ story, onSubmit, onCancel }: { story: Story; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
  return (
    <form key={story.id} className="grid gap-3 md:grid-cols-3" onSubmit={onSubmit}>
      <input className="input" name="title" placeholder="Story 名稱" required defaultValue={story.title} />
      <input className="input" name="description" placeholder="需求 / 交付描述" defaultValue={story.description} />
      <input className="input" name="value" placeholder="價值 / 目的" defaultValue={story.value || ''} />
      <div className="flex gap-2 md:col-span-3">
        <button className="btn-primary" type="submit">儲存 Story</button>
        <button className="btn-secondary" type="button" onClick={onCancel}>取消</button>
      </div>
    </form>
  );
}
