import { useRef, useState } from 'react';
import type { CollectionName, PageKey, WorkspaceData } from './types';
import { AuthGate } from './components/AuthGate';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { TaskCenter } from './pages/TaskCenter';
import { DecisionLog } from './pages/DecisionLog';
import { MeetingNotes } from './pages/MeetingNotes';
import { DocumentIndex } from './pages/DocumentIndex';
import { Reports } from './pages/Reports';
import { useAuth } from './hooks/useAuth';
import { useWorkspaceData } from './hooks/useWorkspaceData';

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { user, authLoading, authError, loginWithGoogle, loginAnonymously, logout } = useAuth();
  const { data, loading, error, saveItem, deleteItem, resetWithMockData, importData } = useWorkspaceData(user);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ai-pm-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text) as WorkspaceData;
    await importData(parsed);
    event.target.value = '';
  };

  const renderPage = () => {
    if (loading) return <div className="card">資料載入中...</div>;
    if (error) return <div className="card text-rose-600">{error}</div>;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'projects':
        return <Projects data={data} saveItem={saveItem} deleteItem={deleteItem} />;
      case 'tasks':
        return <TaskCenter data={data} saveItem={saveItem} deleteItem={deleteItem} />;
      case 'decisions':
        return <DecisionLog data={data} saveItem={saveItem} deleteItem={deleteItem} />;
      case 'meetings':
        return <MeetingNotes data={data} saveItem={saveItem} deleteItem={deleteItem} />;
      case 'documents':
        return <DocumentIndex data={data} saveItem={saveItem} deleteItem={deleteItem} />;
      case 'reports':
        return <Reports data={data} />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <AuthGate
      authLoading={authLoading}
      user={user}
      authError={authError}
      onGoogleLogin={loginWithGoogle}
      onAnonymousLogin={loginAnonymously}
    >
      <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      <Layout
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        data={data}
        userEmail={user?.email || user?.uid || 'Anonymous'}
        onLogout={logout}
        onExport={exportData}
        onImportClick={() => importInputRef.current?.click()}
        onResetMock={resetWithMockData}
      >
        {renderPage()}
      </Layout>
    </AuthGate>
  );
}

export default App;
