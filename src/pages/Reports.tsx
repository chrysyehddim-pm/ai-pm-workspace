import { useState } from 'react';
import type { ReportType, WorkspaceData } from '../types';
import { generateReport } from '../utils/reportGenerator';

const reportTypes: ReportType[] = ['週報', '月報', '會議摘要', '主管摘要'];

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
        <p className="text-sm font-medium text-slate-500">Reports</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">回報產生器</h2>
        <p className="mt-2 text-slate-500">第一版採規則式整理，不串 AI API。輸出後可再貼到 ChatGPT 潤飾。</p>
      </div>

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
        <pre className="mt-5 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-50">{output}</pre>
      </section>
    </div>
  );
}
