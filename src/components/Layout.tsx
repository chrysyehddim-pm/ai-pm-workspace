import type { ReactNode } from 'react';
import type { PageKey, WorkspaceData } from '../types';

const navItems: Array<{ key: PageKey; label: string; short: string; icon: string }> = [
  { key: 'dashboard', label: '首頁總覽', short: '首頁', icon: '⌂' },
  { key: 'tasks', label: '任務中心', short: '任務', icon: '✓' },
  { key: 'projects', label: '專案管理', short: '專案', icon: '▦' },
  { key: 'decisions', label: '決策紀錄', short: '紀錄', icon: '◆' },
  { key: 'meetings', label: '會議紀錄', short: '會議', icon: '◷' },
  { key: 'documents', label: '文件索引', short: '文件', icon: '▤' },
  { key: 'reports', label: '報告中心', short: '報告', icon: '✦' },
];

function countNeedAttention(data: WorkspaceData) {
  return data.tasks.filter((task) => task.tags.includes('需協調') || task.status === '待確認').length;
}

export function Layout({
  children,
  currentPage,
  setCurrentPage,
  data,
  userEmail,
  onLogout,
  onExport,
  onImportClick,
  onSeedSampleData,
}: {
  children: ReactNode;
  currentPage: PageKey;
  setCurrentPage: (page: PageKey) => void;
  data: WorkspaceData;
  userEmail: string;
  onLogout: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onSeedSampleData: () => void;
}) {
  const activeTasks = data.tasks.filter((task) => task.status !== '完成').length;
  const needAttention = countNeedAttention(data);
  const currentLabel = navItems.find((item) => item.key === currentPage)?.label || '首頁總覽';

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <aside className="fixed left-0 top-0 z-20 hidden h-screen w-72 border-r border-slate-200 bg-white/90 p-5 backdrop-blur lg:block">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Personal PM OS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">AI PM Workspace</h1>
          <p className="mt-2 text-sm text-slate-500">個人 PM 專案任務追蹤工作台</p>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                currentPage === item.key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setCurrentPage(item.key)}
            >
              <span className={`grid h-7 w-7 place-items-center rounded-lg text-xs ${currentPage === item.key ? 'bg-white/15' : 'bg-slate-100 text-slate-500'}`}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">登入帳號</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-800">{userEmail}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-secondary px-2 py-2 text-xs" onClick={onExport}>匯出</button>
            <button className="btn-secondary px-2 py-2 text-xs" onClick={onImportClick}>匯入</button>
            <button className="btn-secondary col-span-2 px-2 py-2 text-xs" onClick={onSeedSampleData}>補上範例資料</button>
            <button className="btn-secondary col-span-2 px-2 py-2 text-xs" onClick={onLogout}>登出</button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72 lg:mr-80">
        <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">AI PM Workspace</p>
              <h1 className="text-lg font-semibold text-slate-950">{currentLabel}</h1>
            </div>
            <button className="btn-secondary py-2 text-xs" onClick={onExport}>匯出</button>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>

      <aside className="fixed right-0 top-0 hidden h-screen w-80 border-l border-slate-200 bg-white/85 p-5 backdrop-blur lg:block">
        <h2 className="section-title">工作台摘要</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">未完成任務</p>
            <p className="mt-1 text-3xl font-semibold text-slate-950">{activeTasks}</p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-4">
            <p className="text-xs text-purple-700">需優先關注</p>
            <p className="mt-1 text-3xl font-semibold text-purple-900">{needAttention}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs text-slate-500">使用建議</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              每次會議後先新增會議紀錄，再將行動項目拆成任務。週報前先檢查「需協調」與「待確認」。
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-20 grid grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
        {navItems
          .filter((item) => ['dashboard', 'tasks', 'projects', 'decisions', 'reports'].includes(item.key))
          .map((item) => (
            <button
              key={item.key}
              className={`py-3 text-xs font-medium ${currentPage === item.key ? 'text-slate-950' : 'text-slate-400'}`}
              onClick={() => setCurrentPage(item.key)}
            >
              <span className="block text-sm leading-none">{item.icon}</span>
              <span className="mt-1 block">{item.short}</span>
            </button>
          ))}
      </nav>
    </div>
  );
}
