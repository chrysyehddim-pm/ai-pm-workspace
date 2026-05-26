import type { DocumentIndex as DocumentIndexType, WorkspaceData } from '../types';

export function DocumentIndex({
  data,
  saveItem,
  deleteItem,
}: {
  data: WorkspaceData;
  saveItem: (collectionName: 'documents', payload: Partial<DocumentIndexType>) => Promise<string>;
  deleteItem: (collectionName: 'documents', id: string) => Promise<void>;
}) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await saveItem('documents', {
      projectId: String(formData.get('projectId') || ''),
      epicId: String(formData.get('epicId') || ''),
      name: String(formData.get('name') || ''),
      type: String(formData.get('type')) as DocumentIndexType['type'],
      path: String(formData.get('path') || ''),
      versionNote: String(formData.get('versionNote') || ''),
      purpose: String(formData.get('purpose') || ''),
      lastUpdated: String(formData.get('lastUpdated') || ''),
    });
    event.currentTarget.reset();
  };

  const projectName = (id: string) => data.projects.find((project) => project.id === id)?.name || '未指定專案';
  const epicTitle = (id?: string) => data.epics.find((epic) => epic.id === id)?.title || '未指定 Epic';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Document Index</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">文件索引</h2>
        <p className="mt-2 text-slate-500">只記錄檔名、路徑與版本，不上傳檔案。</p>
      </div>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-3">
          <label><span className="label">文件名稱</span><input name="name" className="input" required /></label>
          <label><span className="label">類型</span><select name="type" className="input" defaultValue="PPT">{['PPT', 'Excel', 'Word', 'PDF', 'Image', 'Link', 'Other'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
          <label><span className="label">最後更新日</span><input name="lastUpdated" type="date" className="input" /></label>
          <label><span className="label">Project</span><select name="projectId" className="input" required>{data.projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <label><span className="label">Epic</span><select name="epicId" className="input"><option value="">未指定</option>{data.epics.map((epic) => <option key={epic.id} value={epic.id}>{epic.title}</option>)}</select></label>
          <label><span className="label">用途</span><input name="purpose" className="input" placeholder="例如 月會 / 規格 / 法務 / 素材" /></label>
        </div>
        <label><span className="label">檔案路徑 / 連結</span><input name="path" className="input" placeholder="本機路徑、P 槽路徑或雲端連結" required /></label>
        <label><span className="label">版本備註</span><input name="versionNote" className="input" placeholder="例如 0526 月會版 / SIT 前規格" /></label>
        <div className="flex justify-end"><button className="btn-primary" type="submit">新增文件索引</button></div>
      </form>

      <section className="grid gap-4 xl:grid-cols-2">
        {data.documents.map((document) => (
          <div key={document.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">{document.type}・{document.lastUpdated || '未填日期'}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{document.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{projectName(document.projectId)}・{epicTitle(document.epicId)}</p>
              </div>
              <button className="text-sm font-medium text-rose-600" onClick={() => deleteItem('documents', document.id)}>刪除</button>
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
