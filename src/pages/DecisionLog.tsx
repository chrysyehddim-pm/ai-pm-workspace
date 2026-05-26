import type { Decision, WorkspaceData } from '../types';

export function DecisionLog({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'decisions', payload: Partial<Decision>) => Promise<string>;
  deleteItem: (collectionName: 'decisions', id: string) => Promise<void>;
}) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await saveItem('decisions', {
      projectId: String(formData.get('projectId') || ''),
      date: String(formData.get('date') || ''),
      decisionMaker: String(formData.get('decisionMaker') || ''),
      content: String(formData.get('content') || ''),
      context: String(formData.get('context') || ''),
      impact: String(formData.get('impact') || ''),
      source: String(formData.get('source')) as Decision['source'],
    });
    event.currentTarget.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const decisions = [...data.decisions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Decision Log</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">決策紀錄</h2>
        <p className="mt-2 text-slate-500">記錄誰在何時決定了什麼，以及影響哪些事項。</p>
      </div>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label>
            <span className="label">Project</span>
            <select className="input" name="projectId" required>
              {data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
            </select>
          </label>
          <label>
            <span className="label">決策日期</span>
            <input className="input" name="date" type="date" required />
          </label>
          <label>
            <span className="label">決策者</span>
            <input className="input" name="decisionMaker" placeholder="例如 小查 / 法務 / PM" required />
          </label>
        </div>
        <label>
          <span className="label">決策內容</span>
          <textarea className="input min-h-24" name="content" required />
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <label>
            <span className="label">背景原因</span>
            <textarea className="input min-h-20" name="context" />
          </label>
          <label>
            <span className="label">影響範圍</span>
            <textarea className="input min-h-20" name="impact" />
          </label>
        </div>
        <label>
          <span className="label">來源</span>
          <select className="input" name="source" defaultValue="Meeting">
            {['Meeting', 'Teams', 'Email', 'Line', 'Personal Note', 'Other'].map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
        <div className="flex justify-end">
          <button className="btn-primary" type="submit">新增決策</button>
        </div>
      </form>

      <section className="space-y-3">
        {decisions.map((decision) => (
          <div key={decision.id} className="card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">{decision.date}・{decision.decisionMaker}・{decision.source}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{decision.content}</h3>
                <p className="mt-2 text-sm text-slate-500">Project：{projectName(decision.projectId)}</p>
              </div>
              <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('decisions', decision.id)}>刪除</button>
            </div>
            {(decision.context || decision.impact) && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">背景原因</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{decision.context || '未填'}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">影響範圍</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{decision.impact || '未填'}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
