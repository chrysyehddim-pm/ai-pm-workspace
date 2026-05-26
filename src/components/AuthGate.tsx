import type { ReactNode } from 'react';
import { isFirebaseConfigured } from '../lib/firebase';

export function AuthGate({
  children,
  authLoading,
  user,
  authError,
  onGoogleLogin,
  onAnonymousLogin,
}: {
  children: ReactNode;
  authLoading: boolean;
  user: unknown;
  authError: string | null;
  onGoogleLogin: () => void;
  onAnonymousLogin: () => void;
}) {
  if (!isFirebaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Setup Required</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">尚未設定 Firebase 環境變數</h1>
          <p className="mt-3 leading-7 text-slate-600">
            請先在 GitHub / Firebase Hosting 的 build 環境設定 <code className="rounded bg-slate-100 px-1">VITE_FIREBASE_*</code> 相關環境變數，或在本機建立 <code className="rounded bg-slate-100 px-1">.env.local</code>。
          </p>
          <p className="mt-4 text-sm text-slate-500">可參考專案內的 <code>.env.example</code>。</p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">登入狀態確認中...</div>;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="card max-w-xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Personal PM OS</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">AI PM Workspace</h1>
          <p className="mt-3 leading-7 text-slate-600">
            用 Project / Epic / Story / Task 結構管理個人專案任務、決策紀錄、會議紀錄與文件索引。
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button className="btn-primary" onClick={onGoogleLogin}>使用 Google 登入</button>
            <button className="btn-secondary" onClick={onAnonymousLogin}>訪客登入測試</button>
          </div>
          {authError && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{authError}</p>}
          <p className="mt-5 text-xs leading-6 text-slate-500">
            第一版不做多人協作、不上傳檔案、不串 AI API。資料會儲存在你的 Firebase Firestore 帳號空間中。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
