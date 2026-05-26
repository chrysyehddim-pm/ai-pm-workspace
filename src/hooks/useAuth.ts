import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInAnonymously, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      setAuthLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthLoading(false);
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider) return;
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google 登入失敗');
    }
  };

  const loginAnonymously = async () => {
    if (!auth) return;
    setAuthError(null);
    try {
      await signInAnonymously(auth);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : '訪客登入失敗');
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  return { user, authLoading, authError, loginWithGoogle, loginAnonymously, logout };
}
