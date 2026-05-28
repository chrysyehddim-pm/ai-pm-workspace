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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const { user, authLoading, authError, loginWithGoogle, loginAnonymously, logout } = useAuth();
  const { data, loading, error, saveItem, deleteItem, seedSampleData, importData } = useWorkspaceData(user);

  const goToPage = (page: PageKey) => {
    setCurrentPage(page);
    if (page !== 'tasks') setSelectedTaskId(null);
    if (page !== 'decisions') setSelectedDecisionId(null);
    if (page !== 'projects') setSelectedProjectId(null);
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ai-pm-workspace-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const confirmDeleteItem = async (collectionName: CollectionName, id: string) => {
    const ok = window.confirm('確定要刪除這筆資料嗎？此操作無法復原。');
    if (!ok) return;
    await deleteItem(collectionName, id);
  };

  const handleSeedSampleData = async () => {
    const ok = window.confirm('此操作只會補上缺少的範例資料，不會刪除你已建立的資料。是否繼續？');
    if (!ok) return;
    await seedSampleData();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ok = window.confirm('匯入資料會清空目前帳號底下的既有資料，並改用匯入檔案內容。是否繼續？');
    if (!ok) {
      event.target.value = '';
      return;
    }
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
        return (
          <Dashboard
            data={data}
            onOpenTask={(taskId) => {
              setSelectedTaskId(taskId);
              setCurrentPage('tasks');
            }}
            onOpenDecision={(decisionId) => {
              setSelectedDecisionId(decisionId);
              setCurrentPage('decisions');
            }}
            onOpenProject={(projectId) => {
              setSelectedProjectId(projectId);
              setCurrentPage('projects');
            }}
          />
        );
      case 'projects':
        return <Projects data={data} saveItem={saveItem} deleteItem={confirmDeleteItem} selectedProjectId={selectedProjectId} onClearSelectedProject={() => setSelectedProjectId(null)} />;
      case 'tasks':
        return <TaskCenter data={data} saveItem={saveItem} deleteItem={confirmDeleteItem} selectedTaskId={selectedTaskId} onClearSelectedTask={() => setSelectedTaskId(null)} />;
      case 'decisions':
        return <DecisionLog data={data} saveItem={saveItem} deleteItem={confirmDeleteItem} selectedDecisionId={selectedDecisionId} onClearSelectedDecision={() => setSelectedDecisionId(null)} />;
      case 'meetings':
        return <MeetingNotes data={data} saveItem={saveItem} deleteItem={confirmDeleteItem} />;
      case 'documents':
        return <DocumentIndex data={data} saveItem={saveItem} deleteItem={confirmDeleteItem} />;
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
        setCurrentPage={goToPage}
        data={data}
        userEmail={user?.email || user?.uid || 'Anonymous'}
        onLogout={logout}
        onExport={exportData}
        onImportClick={() => importInputRef.current?.click()}
        onSeedSampleData={handleSeedSampleData}
      >
        {renderPage()}
      </Layout>
    </AuthGate>
  );
}

export default App;
