import type { MeetingNote, WorkspaceData } from '../types';

export function MeetingNotes({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'meetings', payload: Partial<MeetingNote>) => Promise<string>;
  deleteItem: (collectionName: 'meetings', id: string) => Promise<void>;
}) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await saveItem('meetings', {
      projectId: String(formData.get('projectId') || ''),
      title: String(formData.get('title') || ''),
      date: String(formData.get('date') || ''),
      participants: String(formData.get('participants') || ''),
      rawNotes: String(formData.get('rawNotes') || ''),
      summary: String(formData.get('summary') || ''),
      actionItems: String(formData.get('actionItems') || ''),
      openQuestions: String(formData.get('openQuestions') || ''),
      decisions: String(formData.get('decisions') || ''),
    });
    event.currentTarget.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const meetings = [...data.meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Meeting Notes</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">會議紀錄</h2>
        <p className="mt-2 text-slate-500">保留會議脈絡，後續可拆任務與產出摘要。</p>
      </div>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label><span className="label">Project</span><select name="projectId" className="input" required>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label><span className="label">會議日期</span><input name="date" type="date" className="input" required /></label>
          <label><span className="label">會議名稱</span><input name="title" className="input" required /></label>
        </div>
        <label><span className="label">參與者</span><input name="participants" className="input" placeholder="例如 PM, TPM, IT, 法務" /></label>
        <label><span className="label">原始紀錄</span><textarea name="rawNotes" className="input min-h-28" placeholder="可貼上會議紀錄、Teams 摘要或個人筆記" /></label>
        <div className="grid gap-4 md:grid-cols-2">
          <label><span className="label">會議摘要</span><textarea name="summary" className="input min-h-24" /></label>
          <label><span className="label">行動項目</span><textarea name="actionItems" className="input min-h-24" /></label>
          <label><span className="label">待確認事項</span><textarea name="openQuestions" className="input min-h-24" /></label>
          <label><span className="label">決策事項</span><textarea name="decisions" className="input min-h-24" /></label>
        </div>
        <div className="flex justify-end"><button className="btn-primary" type="submit">新增會議紀錄</button></div>
      </form>

      <section className="space-y-3">
        {meetings.map((meeting) => (
          <div key={meeting.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{meeting.date}・{projectName(meeting.projectId)}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{meeting.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{meeting.participants}</p>
              </div>
              <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('meetings', meeting.id)}>刪除</button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info title="會議摘要" content={meeting.summary} />
              <Info title="行動項目" content={meeting.actionItems} />
              <Info title="待確認事項" content={meeting.openQuestions} />
              <Info title="決策事項" content={meeting.decisions} />
            </div>
          </div>
        ))}
      </section>
    </div>
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
