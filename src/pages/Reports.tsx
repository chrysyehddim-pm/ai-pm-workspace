import { useState } from 'react';
import type { ReportType, WorkspaceData } from '../types';
import { generateReport } from '../utils/reportGenerator';

const reportTypes: ReportType[] = ['週報', '月報', '會議摘要', '主管摘要'];

const reportDescriptions: Record<ReportType, string> = {
  週報: '依目前任務狀態整理本週完成、進行中、需協調與下週重點。',
  月報: '依目前專案、任務與決策紀錄整理本月成果、進度與下月計畫。',
  會議摘要: '依會議紀錄整理會議重點、行動項目、待確認與決策事項。',
  主管摘要: '以高層閱讀情境整理專案進度、需協調事項與重要決策。',
};

export function Reports({ data }: { data: WorkspaceData }) {
  const [reportType, setReportType] = useState<ReportType>('週報');
  const [copied, setCopied] = useState(false);
  const output = generateReport(reportType, data);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">報告中心</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">回報產生器</h2>
        <p className="mt-2 text-slate-500">報告會依目前資料即時產生，不會每日自動建立，也不會自動保存歷史版本。</p>
      </div>

      <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <p className="font-semibold">報告邏輯說明</p>
        <p className="mt-1">這裡是「即時草稿產生器」：每次切換報告類型或資料更新時，系統都會依當下 Project、Task、Decision、Meeting Notes 重新整理文字。若你需要保留特定版本，請複製後貼到 PPT、Email、Teams 或另存文件。</p>
      </section>

      <section className="card">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <label className="md:w-72">
            <span className="label">報告類型</span>
            <select className="input" value={reportType} onChange={(event) => setReportType(event.target.value as ReportType)}>
              {reportTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <button className="btn-primary" onClick={copy}>{copied ? '已複製' : '複製草稿'}</button>
        </div>
        <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{reportDescriptions[reportType]}</p>
        <pre className="mt-5 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-50">{output}</pre>
      </section>
    </div>
  );
}
