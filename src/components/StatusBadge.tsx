import type { ProjectStatus, TaskStatus, TaskTag } from '../types';

const statusClass: Record<string, string> = {
  待整理: 'bg-slate-100 text-slate-700',
  尚未開始: 'bg-slate-100 text-slate-700',
  進行中: 'bg-blue-50 text-blue-700',
  待確認: 'bg-amber-50 text-amber-700',
  需修改: 'bg-rose-50 text-rose-700',
  需協調: 'bg-purple-50 text-purple-700',
  暫緩: 'bg-zinc-100 text-zinc-700',
  完成: 'bg-emerald-50 text-emerald-700',
};

const tagClass: Record<TaskTag, string> = {
  需協調: 'bg-purple-50 text-purple-700',
  待追蹤: 'bg-amber-50 text-amber-700',
  高優先: 'bg-rose-50 text-rose-700',
};

export function StatusBadge({ status }: { status: TaskStatus | ProjectStatus }) {
  return <span className={`badge ${statusClass[status] || statusClass.待整理}`}>{status}</span>;
}

export function TagBadge({ tag }: { tag: TaskTag }) {
  return <span className={`badge ${tagClass[tag]}`}>{tag}</span>;
}
