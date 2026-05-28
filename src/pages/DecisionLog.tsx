import { useEffect, useState } from 'react';
import type { Decision, WorkspaceData } from '../types';

export function DecisionLog({
  data,
  saveItem,
  deleteItem,
  selectedDecisionId,
  onClearSelectedDecision,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'decisions', payload: Partial<Decision>) => Promise<string>;
  deleteItem: (collectionName: 'decisions', id: string) => Promise<void>;
  selectedDecisionId?: string | null;
  onClearSelectedDecision?: () => void;
}) {
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);
  const [viewingDecisionId, setViewingDecisionId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDecisionId) {
      setViewingDecisionId(selectedDecisionId);
      setEditingDecision(null);
      onClearSelectedDecision?.();
    }
  }, [selectedDecisionId, onClearSelectedDecision]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const id = await saveItem('decisions', {
      ...(editingDecision || {}),
      projectId: String(formData.get('projectId') || ''),
      date: String(formData.get('date') || ''),
      decisionMaker: String(formData.get('decisionMaker') || ''),
      content: String(formData.get('content') || ''),
      context: String(formData.get('context') || ''),
      impact: String(formData.get('impact') || ''),
      source: String(formData.get('source')) as Decision['source'],
    });
    setEditingDecision(null);
    setViewingDecisionId(id);
    form.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const decisions = [...data.decisions].sort((a, b) => b.date.localeCompare(a.date));
  const viewingDecision = viewingDecisionId ? data.decisions.find((decision) => decision.id === viewingDecisionId) : null;

  if (viewingDecision) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-900" onClick={() => setViewingDecisionId(null)}>← 返回決策列表</button>
            <p className="mt-4 text-sm font-medium text-slate-500">決策紀錄</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">決策詳情</h2>
            <p className="mt-2 text-slate-500">查看單一決策的背景、影響與來源。</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => {
              setEditingDecision(viewingDecision);
              setViewingDecisionId(null);
            }}>編輯</button>
            <button className="btn-secondary text-rose-600" onClick={async () => {
              await deleteItem('decisions', viewingDecision.id);
              setViewingDecisionId(null);
            }}>刪除</button>
          </div>
        </div>

        <section className="card space-y-4">
          <div>
            <p className="text-xs font-medium text-slate-500">{viewingDecision.date}・{viewingDecision.decisionMaker}・{viewingDecision.source}</p>
            <h3 className="mt-3 text-2xl font-semibold leading-8 text-slate-950">{viewingDecision.content}</h3>
            <p className="mt-3 text-sm text-slate-500">Project：{projectName(viewingDecision.projectId)}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Info title="背景原因" content={viewingDecision.context} />
            <Info title="影響範圍" content={viewingDecision.impact} />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">決策紀錄</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">決策紀錄</h2>
        <p className="mt-2 text-slate-500">記錄誰在何時決定了什麼，以及影響哪些事項。點擊決策可查看詳情。</p>
      </div>

      <DecisionForm
        key={editingDecision?.id || 'new-decision'}
        data={data}
        decision={editingDecision || undefined}
        onSubmit={handleSubmit}
        onCancel={() => setEditingDecision(null)}
      />

      <section className="space-y-3">
        {decisions.length === 0 && <div className="card muted">目前尚無決策紀錄。</div>}
        {decisions.map((decision) => (
          <div key={decision.id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <button className="flex-1 text-left" onClick={() => setViewingDecisionId(decision.id)}>
                <p className="text-xs font-medium text-slate-500">{decision.date}・{decision.decisionMaker}・{decision.source}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{decision.content}</h3>
                <p className="mt-2 text-sm text-slate-500">Project：{projectName(decision.projectId)}</p>
              </button>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setEditingDecision(decision)}>編輯</button>
                <button className="btn-secondary text-rose-600" onClick={() => deleteItem('decisions', decision.id)}>刪除</button>
              </div>
            </div>
            {(decision.context || decision.impact) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <Info title="背景原因" content={decision.context} />
                <Info title="影響範圍" content={decision.impact} />
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

function DecisionForm({
  data,
  decision,
  onSubmit,
  onCancel,
}: {
  data: WorkspaceData;
  decision?: Decision;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title">{decision ? '編輯決策' : '新增決策'}</h3>
        {decision && <button type="button" className="text-sm font-medium text-slate-500" onClick={onCancel}>取消編輯</button>}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label>
          <span className="label">Project</span>
          <select className="input" name="projectId" required defaultValue={decision?.projectId || ''}>
            <option value="" disabled>請選擇專案</option>
            {data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
          </select>
        </label>
        <label>
          <span className="label">決策日期</span>
          <input className="input" name="date" type="date" required defaultValue={decision?.date || ''} />
        </label>
        <label>
          <span className="label">決策者</span>
          <input className="input" name="decisionMaker" placeholder="例如 小查 / 法務 / PM" required defaultValue={decision?.decisionMaker || ''} />
        </label>
      </div>
      <label>
        <span className="label">決策內容</span>
        <textarea className="input min-h-24" name="content" required defaultValue={decision?.content || ''} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">背景原因</span>
          <textarea className="input min-h-20" name="context" defaultValue={decision?.context || ''} />
        </label>
        <label>
          <span className="label">影響範圍</span>
          <textarea className="input min-h-20" name="impact" defaultValue={decision?.impact || ''} />
        </label>
      </div>
      <label>
        <span className="label">來源</span>
        <select className="input" name="source" defaultValue={decision?.source || 'Meeting'}>
          {['Meeting', 'Teams', 'Email', 'Line', 'Personal Note', 'Other'].map((source) => <option key={source} value={source}>{source}</option>)}
        </select>
      </label>
      <div className="flex justify-end">
        <button className="btn-primary" type="submit">{decision ? '儲存決策' : '新增決策'}</button>
      </div>
    </form>
  );
}

function Info({ title, content }: { title: string; content?: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{content || '未填'}</p>
    </div>
  );
}
