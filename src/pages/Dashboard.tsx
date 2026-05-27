import { StatCard } from '../components/StatCard';
import { StatusBadge, TagBadge } from '../components/StatusBadge';
import type { WorkspaceData } from '../types';
import { isWithinDays } from '../utils/date';
import { getProjectSummary } from '../utils/projectMetrics';

export function Dashboard({ data }: { data: WorkspaceData }) {
  const unfinished = data.tasks.filter((task) => task.status !== '完成');
  const weeklyFollowUps = unfinished.filter((task) => task.tags.includes('待追蹤') || isWithinDays(task.dueDate, 7));
  const coordination = unfinished.filter((task) => task.tags.includes('需協調'));
  const waitingReview = unfinished.filter((task) => task.status === '待確認');
  const recentDecisions = [...data.decisions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Dashboard</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">本週專案工作台</h2>
        <p className="mt-2 text-slate-500">快速掌握待追、需協調、待確認與最近決策。</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="專案數" value={data.projects.length} hint="目前工作空間中的 Project" />
        <StatCard label="未完成任務" value={unfinished.length} hint="不含完成狀態" />
        <StatCard label="需協調事項" value={coordination.length} hint="需要 PM 主動推進" />
        <StatCard label="待確認事項" value={waitingReview.length} hint="等待他人確認或回覆" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="card xl:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="section-title">本週待追</h3>
            <span className="muted">{weeklyFollowUps.length} 項</span>
          </div>
          <div className="mt-4 space-y-3">
            {weeklyFollowUps.length === 0 && <p className="muted">目前沒有本週待追任務。</p>}
            {weeklyFollowUps.slice(0, 6).map((task) => (
              <div key={task.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium text-slate-950">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.assignee || '未填負責人'}・{task.dueDate || '未設定日期'}</p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.tags.map((tag) => <TagBadge key={tag} tag={tag} />)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="section-title">最近決策</h3>
          <div className="mt-4 space-y-3">
            {recentDecisions.length === 0 && <p className="muted">目前尚無決策紀錄。</p>}
            {recentDecisions.map((decision) => (
              <div key={decision.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{decision.date}・{decision.decisionMaker}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-slate-800">{decision.content}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="card">
          <h3 className="section-title">需協調事項</h3>
          <div className="mt-4 space-y-3">
            {coordination.length === 0 && <p className="muted">目前沒有需協調事項。</p>}
            {coordination.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start justify-between gap-3 rounded-2xl bg-purple-50 p-3">
                <div>
                  <p className="text-sm font-medium text-purple-950">{task.title}</p>
                  <p className="mt-1 text-xs text-purple-700">{task.assignee || '未填負責人'}・{task.department || '未填單位'}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3 className="section-title">專案概況</h3>
          <div className="mt-4 space-y-3">
            {data.projects.map((project) => {
              const summary = getProjectSummary(data, project.id);
              return (
                <div key={project.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-950">{project.name}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{project.goal}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        進度：{summary.completion.completed}/{summary.completion.total} 完成（{summary.completion.percent}%）
                        {summary.attention.coordination > 0 ? `・需協調 ${summary.attention.coordination}` : ''}
                        {summary.attention.review > 0 ? `・待確認 ${summary.attention.review}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={summary.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
