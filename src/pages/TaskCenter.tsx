import { useMemo, useState } from 'react';
import { StatusBadge, TagBadge } from '../components/StatusBadge';
import { TaskForm } from '../components/TaskForm';
import type { Task, TaskHistory, TaskHistoryType, TaskStatus, TaskTag, WorkspaceData } from '../types';

const statuses: Array<'全部' | TaskStatus> = ['全部', '待整理', '尚未開始', '進行中', '待確認', '需修改', '暫緩', '完成'];
const taskStatuses: TaskStatus[] = ['待整理', '尚未開始', '進行中', '待確認', '需修改', '暫緩', '完成'];
const tags: Array<'全部' | TaskTag> = ['全部', '需協調', '待追蹤', '高優先'];
const historyTypes: TaskHistoryType[] = ['討論', '修改', '追蹤', '決策', '備註'];

function buildTaskSummary(task: Task) {
  const raw = task.summary || task.description || task.notes || '尚未填寫摘要。';
  return raw.length > 90 ? `${raw.slice(0, 90)}...` : raw;
}

function formatDateTime(value: string) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function TaskCenter({
  data,
  saveItem,
  deleteItem,
  selectedTaskId,
  onClearSelectedTask,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'tasks', payload: Partial<Task>) => Promise<string>;
  deleteItem: (collectionName: 'tasks', id: string) => Promise<void>;
  selectedTaskId?: string | null;
  onClearSelectedTask?: () => void;
}) {
  const [mode, setMode] = useState<'list' | 'create'>('list');
  const [localSelectedTaskId, setLocalSelectedTaskId] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | TaskStatus>('全部');
  const [tagFilter, setTagFilter] = useState<'全部' | TaskTag>('全部');
  const [keyword, setKeyword] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const activeTaskId = selectedTaskId || localSelectedTaskId;
  const selectedTask = activeTaskId ? data.tasks.find((task) => task.id === activeTaskId) : undefined;

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((task) => {
      const matchProject = projectFilter === '全部' || task.projectId === projectFilter;
      const matchStatus = statusFilter === '全部' || task.status === statusFilter;
      const matchTag = tagFilter === '全部' || task.tags.includes(tagFilter);
      const text = `${task.title} ${task.summary || ''} ${task.description || ''} ${task.assignee || ''} ${task.department || ''} ${task.notes || ''}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword.toLowerCase());
      return matchProject && matchStatus && matchTag && matchKeyword;
    });
  }, [data.tasks, keyword, projectFilter, statusFilter, tagFilter]);

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const epicName = (id?: string) => id ? data.epics.find((epic) => epic.id === id)?.title || '未指定 Epic' : '未指定 Epic';
  const storyName = (id?: string) => id ? data.stories.find((story) => story.id === id)?.title || '未指定 Story' : '未指定 Story';

  const openTask = (taskId: string) => {
    setMode('list');
    setLocalSelectedTaskId(taskId);
  };

  const closeTask = () => {
    setLocalSelectedTaskId(null);
    onClearSelectedTask?.();
  };

  const handleCreate = async (payload: Partial<Task>) => {
    const id = await saveItem('tasks', payload);
    setMode('list');
    setLocalSelectedTaskId(id);
  };

  const handleSave = async (payload: Partial<Task>) => {
    await saveItem('tasks', payload);
    setStatusMessage('任務已儲存');
    window.setTimeout(() => setStatusMessage(''), 1800);
  };

  const handleStatusChange = async (task: Task, nextStatus: TaskStatus) => {
    await saveItem('tasks', { ...task, status: nextStatus });
    setStatusMessage('狀態已更新');
    window.setTimeout(() => setStatusMessage(''), 1800);
  };

  if (mode === 'create') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">任務中心</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">新增任務</h2>
            <p className="mt-2 text-slate-500">快速建立最小追蹤單位，Epic / Story 可之後再補。</p>
          </div>
          <button className="btn-secondary" onClick={() => setMode('list')}>返回任務列表</button>
        </div>
        <TaskForm
          projects={data.projects}
          epics={data.epics}
          stories={data.stories}
          onCancel={() => setMode('list')}
          onSave={handleCreate}
        />
      </div>
    );
  }

  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        data={data}
        projectName={projectName}
        epicName={epicName}
        storyName={storyName}
        onBack={closeTask}
        onSave={handleSave}
        onDelete={async () => {
          await deleteItem('tasks', selectedTask.id);
          closeTask();
        }}
        statusMessage={statusMessage}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">任務中心</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">任務中心</h2>
          <p className="mt-2 text-slate-500">集中追蹤待辦、需協調、待確認與修改項目。列表只顯示摘要，點進詳情可查看完整脈絡。</p>
        </div>
        <button className="btn-primary" onClick={() => setMode('create')}>新增任務</button>
      </div>

      {statusMessage && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{statusMessage}</div>}

      <section className="card">
        <div className="grid gap-3 md:grid-cols-4">
          <label>
            <span className="label">專案</span>
            <select className="input" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
              <option value="全部">全部</option>
              {data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">狀態</span>
            <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
              {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>
          <label>
            <span className="label">標籤</span>
            <select className="input" value={tagFilter} onChange={(event) => setTagFilter(event.target.value as typeof tagFilter)}>
              {tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
          </label>
          <label>
            <span className="label">搜尋</span>
            <input className="input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="任務 / 摘要 / 負責人" />
          </label>
        </div>
      </section>

      <section className="space-y-3">
        {filteredTasks.length === 0 && <div className="card muted">目前沒有符合條件的任務。</div>}
        {filteredTasks.map((task) => (
          <article key={task.id} className="card transition hover:border-slate-300">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <button className="min-w-0 flex-1 text-left" onClick={() => openTask(task.id)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-950">{task.title}</h3>
                  <span className="badge bg-slate-100 text-slate-600">{projectName(task.projectId)}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{buildTaskSummary(task)}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {task.assignee || '未填負責人'}・{task.department || '未填單位'}・{task.dueDate || '未設定日期'}
                </p>
              </button>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
                <select
                  className="input min-w-32"
                  value={task.status}
                  onChange={(event) => handleStatusChange(task, event.target.value as TaskStatus)}
                  aria-label="切換任務狀態"
                >
                  {taskStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary" onClick={() => openTask(task.id)}>詳情</button>
                  <button className="btn-secondary text-rose-600" onClick={() => deleteItem('tasks', task.id)}>刪除</button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function TaskDetail({
  task,
  data,
  projectName,
  epicName,
  storyName,
  onBack,
  onSave,
  onDelete,
  statusMessage,
}: {
  task: Task;
  data: WorkspaceData;
  projectName: (id: string) => string;
  epicName: (id?: string) => string;
  storyName: (id?: string) => string;
  onBack: () => void;
  onSave: (payload: Partial<Task>) => Promise<void>;
  onDelete: () => Promise<void>;
  statusMessage: string;
}) {
  const [historyType, setHistoryType] = useState<TaskHistoryType>('追蹤');
  const [historyContent, setHistoryContent] = useState('');
  const [savingHistory, setSavingHistory] = useState(false);
  const sortedHistory = [...(task.history || [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const addHistory = async () => {
    if (!historyContent.trim()) return;
    setSavingHistory(true);
    try {
      const nextHistory: TaskHistory = {
        id: crypto.randomUUID(),
        type: historyType,
        content: historyContent.trim(),
        createdAt: new Date().toISOString(),
        createdBy: '我',
      };
      await onSave({ ...task, history: [...(task.history || []), nextHistory] });
      setHistoryContent('');
      setHistoryType('追蹤');
    } finally {
      setSavingHistory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-900" onClick={onBack}>← 返回任務列表</button>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{task.title}</h2>
          <p className="mt-2 text-slate-500">任務詳情、描述與歷程紀錄。此頁不顯示其他任務，讓操作焦點更清楚。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          {task.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
        </div>
      </div>

      {statusMessage && <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{statusMessage}</div>}

      <section className="grid gap-4 lg:grid-cols-4">
        <InfoCard label="Project" value={projectName(task.projectId)} />
        <InfoCard label="Epic" value={epicName(task.epicId)} />
        <InfoCard label="Story" value={storyName(task.storyId)} />
        <InfoCard label="負責 / 日期" value={`${task.assignee || '未填負責人'}・${task.dueDate || '未設定日期'}`} />
      </section>

      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="section-title">任務內容編輯</h3>
          <button className="btn-secondary text-rose-600" onClick={onDelete}>刪除此任務</button>
        </div>
        <TaskForm
          projects={data.projects}
          epics={data.epics}
          stories={data.stories}
          initialTask={task}
          onCancel={onBack}
          onSave={onSave}
        />
      </section>

      <section className="card space-y-4">
        <div>
          <h3 className="section-title">歷程紀錄</h3>
          <p className="mt-2 text-sm text-slate-500">像留言一樣記錄討論、修改、追蹤、決策與備註。內容先以 Markdown 純文字保存，後續可升級預覽。</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
          <select className="input" value={historyType} onChange={(event) => setHistoryType(event.target.value as TaskHistoryType)}>
            {historyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <textarea
            className="input min-h-20"
            value={historyContent}
            onChange={(event) => setHistoryContent(event.target.value)}
            placeholder="例如：已與 Peter 確認退出群組後需回到尚未建立群組畫面。可用 Markdown 條列。"
          />
          <button className="btn-primary h-fit" onClick={addHistory} disabled={savingHistory || !historyContent.trim()}>
            {savingHistory ? '新增中...' : '新增紀錄'}
          </button>
        </div>

        <div className="space-y-3">
          {sortedHistory.length === 0 && <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">目前尚無歷程紀錄。</div>}
          {sortedHistory.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="badge bg-slate-100 text-slate-700">{item.type}</span>
                <span>{formatDateTime(item.createdAt)}</span>
                {item.createdBy && <span>｜{item.createdBy}</span>}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">{item.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
