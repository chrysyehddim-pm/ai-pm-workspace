import { useState } from 'react';
import type { DocumentIndex as DocumentIndexType, WorkspaceData } from '../types';

const documentTypes: DocumentIndexType['type'][] = ['PPT', 'Excel', 'Word', 'PDF', 'Image', 'Link', 'Other'];

export function DocumentIndex({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'documents', payload: Partial<DocumentIndexType>) => Promise<string>;
  deleteItem: (collectionName: 'documents', id: string) => Promise<void>;
}) {
  const [editingDocument, setEditingDocument] = useState<DocumentIndexType | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    await saveItem('documents', {
      ...(editingDocument || {}),
      projectId: String(formData.get('projectId') || ''),
      epicId: String(formData.get('epicId') || '') || undefined,
      name: String(formData.get('name') || ''),
      type: String(formData.get('type')) as DocumentIndexType['type'],
      path: String(formData.get('path') || ''),
      versionNote: String(formData.get('versionNote') || ''),
      purpose: String(formData.get('purpose') || ''),
      lastUpdated: String(formData.get('lastUpdated') || ''),
    });
    setEditingDocument(null);
    form.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const epicTitle = (id?: string) => data.epics.find((epic) => epic.id === id)?.title || '未指定 Epic';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">文件索引</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">文件索引</h2>
        <p className="mt-2 text-slate-500">只記錄檔名、路徑與版本，不上傳檔案。適合追蹤 PPT、Excel 規格、素材與雲端連結。</p>
      </div>

      <DocumentForm
        key={editingDocument?.id || 'new-document'}
        data={data}
        document={editingDocument || undefined}
        onSubmit={handleSubmit}
        onCancel={() => setEditingDocument(null)}
      />

      <section className="grid gap-4 xl:grid-cols-2">
        {data.documents.length === 0 && <div className="card muted xl:col-span-2">目前尚無文件索引。</div>}
        {data.documents.map((document) => (
          <div key={document.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{document.type}・{document.lastUpdated || '未填日期'}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{document.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{projectName(document.projectId)}・{epicTitle(document.epicId)}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary" onClick={() => setEditingDocument(document)}>編輯</button>
                <button className="btn-secondary text-rose-600" onClick={() => deleteItem('documents', document.id)}>刪除</button>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-medium text-slate-500">路徑 / 連結</p>
              <p className="mt-1 break-all text-sm leading-6 text-slate-700">{document.path}</p>
            </div>
            <p className="mt-3 text-sm text-slate-500">{document.versionNote || '未填版本備註'}・{document.purpose || '未填用途'}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function DocumentForm({
  data,
  document,
  onSubmit,
  onCancel,
}: {
  data: WorkspaceData;
  document?: DocumentIndexType;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  const projectEpics = document?.projectId
    ? data.epics.filter((epic) => epic.projectId === document.projectId)
    : data.epics;

  return (
    <form className="card space-y-4" onSubmit={onSubmit}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="section-title">{document ? '編輯文件索引' : '新增文件索引'}</h3>
        {document && <button type="button" className="text-sm font-medium text-slate-500" onClick={onCancel}>取消編輯</button>}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label><span className="label">文件名稱</span><input name="name" className="input" required defaultValue={document?.name || ''} /></label>
        <label><span className="label">類型</span><select name="type" className="input" defaultValue={document?.type || 'PPT'}>{documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
        <label><span className="label">最後更新日</span><input name="lastUpdated" type="date" className="input" defaultValue={document?.lastUpdated || ''} /></label>
        <label><span className="label">Project</span><select name="projectId" className="input" required defaultValue={document?.projectId || ''}><option value="" disabled>請選擇專案</option>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
        <label><span className="label">Epic</span><select name="epicId" className="input" defaultValue={document?.epicId || ''}><option value="">未指定</option>{projectEpics.map((epic) => <option key={epic.id} value={epic.id}>{epic.title}</option>)}</select></label>
        <label><span className="label">用途</span><input name="purpose" className="input" placeholder="例如 月會 / 規格 / 法務 / 素材" defaultValue={document?.purpose || ''} /></label>
      </div>
      <label><span className="label">檔案路徑 / 連結</span><input name="path" className="input" placeholder="本機路徑、P 槽路徑或雲端連結" required defaultValue={document?.path || ''} /></label>
      <label><span className="label">版本備註</span><input name="versionNote" className="input" placeholder="例如 0526 月會版 / SIT 前規格" defaultValue={document?.versionNote || ''} /></label>
      <div className="flex justify-end"><button className="btn-primary" type="submit">{document ? '儲存文件索引' : '新增文件索引'}</button></div>
    </form>
  );
}
