import { useMemo, useState } from 'react';
import type { Epic, Project, Story, Task, TaskStatus, TaskTag } from '../types';

const statuses: TaskStatus[] = ['待整理', '尚未開始', '進行中', '待確認', '需修改', '暫緩', '完成'];
const tags: TaskTag[] = ['需協調', '待追蹤', '高優先'];

export function TaskForm({
  projects,
  epics,
  stories,
  initialTask,
  onCancel,
  onSave,
}: {
  projects: Project[];
  epics: Epic[];
  stories: Story[];
  initialTask?: Task;
  onCancel: () => void;
  onSave: (payload: Partial<Task>) => Promise<void>;
}) {
  const [projectId, setProjectId] = useState(initialTask?.projectId || projects[0]?.id || '');
  const [epicId, setEpicId] = useState(initialTask?.epicId || '');
  const [storyId, setStoryId] = useState(initialTask?.storyId || '');
  const [saving, setSaving] = useState(false);

  const projectEpics = useMemo(() => epics.filter((epic) => epic.projectId === projectId), [epics, projectId]);
  const projectStories = useMemo(
    () => stories.filter((story) => story.projectId === projectId && (!epicId || story.epicId === epicId)),
    [epicId, projectId, stories],
  );

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    setEpicId('');
    setStoryId('');
  };

  const handleEpicChange = (nextEpicId: string) => {
    setEpicId(nextEpicId);
    setStoryId('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedTags = tags.filter((tag) => formData.get(`tag-${tag}`));
    setSaving(true);
    try {
      await onSave({
        id: initialTask?.id,
        title: String(formData.get('title') || ''),
        summary: String(formData.get('summary') || ''),
        description: String(formData.get('description') || ''),
        projectId,
        epicId: epicId || undefined,
        storyId: storyId || undefined,
        assignee: String(formData.get('assignee') || ''),
        department: String(formData.get('department') || ''),
        status: String(formData.get('status')) as TaskStatus,
        priority: String(formData.get('priority')) as Task['priority'],
        dueDate: String(formData.get('dueDate') || ''),
        source: String(formData.get('source')) as Task['source'],
        notes: String(formData.get('notes') || ''),
        tags: selectedTags,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card space-y-4" onSubmit={handleSubmit}>
      <div className="rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        Task 是最小追蹤單位，Project 必填；Epic / Story 可先留空，之後再補齊歸類。任務描述與歷程紀錄可先用 Markdown 純文字書寫。
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">任務名稱</span>
          <input name="title" className="input" defaultValue={initialTask?.title} required />
        </label>
        <label>
          <span className="label">負責人</span>
          <input name="assignee" className="input" defaultValue={initialTask?.assignee} placeholder="例如 Peter / Jerry / Chrys" />
        </label>
        <label>
          <span className="label">Project</span>
          <select className="input" value={projectId} onChange={(event) => handleProjectChange(event.target.value)} required>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Epic（選填）</span>
          <select name="epicId" className="input" value={epicId} onChange={(event) => handleEpicChange(event.target.value)}>
            <option value="">未指定</option>
            {projectEpics.map((epic) => <option key={epic.id} value={epic.id}>{epic.title}</option>)}
          </select>
        </label>
        <label>
          <span className="label">Story（選填）</span>
          <select name="storyId" className="input" value={storyId} onChange={(event) => setStoryId(event.target.value)}>
            <option value="">未指定</option>
            {projectStories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}
          </select>
        </label>
        <label>
          <span className="label">單位</span>
          <input name="department" className="input" defaultValue={initialTask?.department} placeholder="例如 IT / 法務 / 品牌" />
        </label>
        <label>
          <span className="label">狀態</span>
          <select name="status" className="input" defaultValue={initialTask?.status || '尚未開始'}>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span className="label">優先級</span>
          <select name="priority" className="input" defaultValue={initialTask?.priority || '中'}>
            {['低', '中', '高'].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
        </label>
        <label>
          <span className="label">截止日</span>
          <input name="dueDate" type="date" className="input" defaultValue={initialTask?.dueDate} />
        </label>
        <label>
          <span className="label">來源</span>
          <select name="source" className="input" defaultValue={initialTask?.source || 'Personal Note'}>
            {['Meeting', 'Teams', 'Email', 'Line', 'Personal Note', 'Other'].map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
      </div>
      <label>
        <span className="label">任務摘要</span>
        <input name="summary" className="input" defaultValue={initialTask?.summary} placeholder="列表顯示用，建議 40–80 字。未填則自動取描述前段。" />
      </label>
      <label>
        <span className="label">任務描述（Markdown-ready）</span>
        <textarea name="description" className="input min-h-28" defaultValue={initialTask?.description} placeholder="可用條列、待辦清單或簡單 Markdown 純文字記錄背景與驗收條件。" />
      </label>
      <label>
        <span className="label">備註</span>
        <textarea name="notes" className="input min-h-20" defaultValue={initialTask?.notes} />
      </label>
      <div>
        <span className="label">標籤</span>
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <label key={tag} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
              <input type="checkbox" name={`tag-${tag}`} defaultChecked={initialTask?.tags.includes(tag)} />
              {tag}
            </label>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={onCancel}>取消</button>
        <button type="submit" className="btn-primary" disabled={saving}>{saving ? '儲存中...' : '儲存任務'}</button>
      </div>
    </form>
  );
}
