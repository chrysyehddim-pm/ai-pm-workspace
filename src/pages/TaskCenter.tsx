import { useMemo, useState } from 'react';
import { StatusBadge, TagBadge } from '../components/StatusBadge';
import { TaskForm } from '../components/TaskForm';
import type { Task, TaskStatus, TaskTag, WorkspaceData } from '../types';

const statuses: Array<'全部' | TaskStatus> = ['全部', '待整理', '尚未開始', '進行中', '待確認', '需修改', '暫緩', '完成'];
const tags: Array<'全部' | TaskTag> = ['全部', '需協調', '待追蹤', '高優先'];

export function TaskCenter({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'tasks', payload: Partial<Task>) => Promise<string>;
  deleteItem: (collectionName: 'tasks', id: string) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [projectFilter, setProjectFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | TaskStatus>('全部');
  const [tagFilter, setTagFilter] = useState<'全部' | TaskTag>('全部');
  const [keyword, setKeyword] = useState('');

  const filteredTasks = useMemo(() => {
    return data.tasks.filter((task) => {
      const matchProject = projectFilter === '全部' || task.projectId === projectFilter;
      const matchStatus = statusFilter === '全部' || task.status === statusFilter;
      const matchTag = tagFilter === '全部' || task.tags.includes(tagFilter);
      const text = `${task.title} ${task.assignee || ''} ${task.department || ''} ${task.notes || ''}`.toLowerCase();
      const matchKeyword = !keyword || text.includes(keyword.toLowerCase());
      return matchProject && matchStatus && matchTag && matchKeyword;
    });
  }, [data.tasks, keyword, projectFilter, statusFilter, tagFilter]);

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';

  const handleSave = async (payload: Partial<Task>) => {
    await saveItem('tasks', payload);
    setShowForm(false);
    setEditingTask(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">任務中心</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">任務中心</h2>
          <p className="mt-2 text-slate-500">集中追蹤待辦、需協調、待確認與修改項目。</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>新增任務</button>
      </div>

      {(showForm || editingTask) && (
        <TaskForm
          projects={data.projects}
          epics={data.epics}
          stories={data.stories}
          initialTask={editingTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(undefined);
          }}
          onSave={handleSave}
        />
      )}

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
            <input className="input" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="任務 / 負責人 / 單位" />
          </label>
        </div>
      </section>

      <section className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">任務</th>
              <th className="px-4 py-3">專案</th>
              <th className="px-4 py-3">負責</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">標籤</th>
              <th className="px-4 py-3">日期</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <tr key={task.id}>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-950">{task.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{task.notes}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">{projectName(task.projectId)}</td>
                <td className="px-4 py-4 text-slate-600">{task.assignee || '未填'}</td>
                <td className="px-4 py-4"><StatusBadge status={task.status} /></td>
                <td className="px-4 py-4"><div className="flex flex-wrap gap-1">{task.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}</div></td>
                <td className="px-4 py-4 text-slate-600">{task.dueDate || '-'}</td>
                <td className="px-4 py-4">
                  <div className="flex gap-2">
                    <button className="text-sm font-medium text-slate-700" onClick={() => setEditingTask(task)}>編輯</button>
                    <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('tasks', task.id)}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="space-y-3 lg:hidden">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-950">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{projectName(task.projectId)}・{task.assignee || '未填負責人'}</p>
              </div>
              <StatusBadge status={task.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">{task.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}</div>
            <p className="mt-3 text-sm text-slate-500">{task.notes}</p>
            <div className="mt-4 flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setEditingTask(task)}>編輯</button>
              <button className="btn-secondary flex-1 text-rose-600" onClick={() => deleteItem('tasks', task.id)}>刪除</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
