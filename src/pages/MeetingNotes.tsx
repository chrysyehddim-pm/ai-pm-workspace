import { useState } from 'react';
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
  const [editingMeeting, setEditingMeeting] = useState<MeetingNote | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await saveItem('meetings', {
      ...(editingMeeting || {}),
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
    setEditingMeeting(null);
    form.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const meetings = [...data.meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">會議紀錄</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">會議紀錄</h2>
        <p className="mt-2 text-slate-500">保留會議脈絡，後續可拆任務、補決策與產出摘要。</p>
      </div>

      <MeetingForm
        key={editingMeeting?.id || 'new-meeting'}
        data={data}
        meeting={editingMeeting || undefined}
        onSubmit={handleSubmit}
        onCancel={() => setEditingMeeting(null)}
      />

      <section className="space-y-3">
        {meetings.length === 0 && <div className="card muted">目前尚無會議紀錄。</div>}
        {meetings.map((meeting) => (
          <div key={meeting.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{meeting.date}・{projectName(meeting.projectId)}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{meeting.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{meeting.participants || '未填參與者'}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setEditingMeeting(meeting)}>編輯</button>
                <button className="btn-secondary text-rose-600" onClick={() => deleteItem('meetings', meeting.id)}>刪除</button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Info title="會議摘要" content={meeting.summary} />
              <Info title="行動項目" content={meeting.actionItems} />
              <Info title="待確認事項" content={meeting.openQuestions} />
              <Info title="決策事項" content={meeting.decisions} />
            </div>
            {meeting.rawNotes && <Info className="mt-3" title="原始紀錄" content={meeting.rawNotes} />}
          </div>
        ))}
      </section>
    </div>
  );
}

function MeetingForm({
  data,
  meeting,
  onSubmit,
  onCancel,
}: {
  data: WorkspaceData;
  meeting?: MeetingNote;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title">{meeting ? '編輯會議紀錄' : '新增會議紀錄'}</h3>
        {meeting && <button type="button" className="text-sm font-medium text-slate-500" onClick={onCancel}>取消編輯</button>}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="label">Project</span><select name="projectId" className="input" required defaultValue={meeting?.projectId || ''}><option value="" disabled>請選擇專案</option>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label><span className="label">會議日期</span><input name="date" type="date" className="input" required defaultValue={meeting?.date || ''} /></label>
        <label><span className="label">會議名稱</span><input name="title" className="input" required defaultValue={meeting?.title || ''} /></label>
      </div>
      <label><span className="label">參與者</span><input name="participants" className="input" placeholder="例如 PM, TPM, IT, 法務" defaultValue={meeting?.participants || ''} /></label>
      <label><span className="label">原始紀錄</span><textarea name="rawNotes" className="input min-h-28" placeholder="可貼上會議紀錄、Teams 摘要或個人筆記" defaultValue={meeting?.rawNotes || ''} /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label><span className="label">會議摘要</span><textarea name="summary" className="input min-h-24" defaultValue={meeting?.summary || ''} /></label>
        <label><span className="label">行動項目</span><textarea name="actionItems" className="input min-h-24" defaultValue={meeting?.actionItems || ''} /></label>
        <label><span className="label">待確認事項</span><textarea name="openQuestions" className="input min-h-24" defaultValue={meeting?.openQuestions || ''} /></label>
        <label><span className="label">決策事項</span><textarea name="decisions" className="input min-h-24" defaultValue={meeting?.decisions || ''} /></label>
      </div>
      <div className="flex justify-end"><button className="btn-primary" type="submit">{meeting ? '儲存會議紀錄' : '新增會議紀錄'}</button></div>
    </form>
  );
}

function Info({ title, content, className = '' }: { title: string; content?: string; className?: string }) {
  return (
    <div className={`rounded-2xl bg-slate-50 p-3 ${className}`}>
      <p className="text-xs font-medium text-slate-500">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-700">{content || '未填'}</p>
    </div>
  );
}
