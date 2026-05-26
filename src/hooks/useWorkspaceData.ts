import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { buildMockData } from '../data/mockData';
import type { CollectionName, WorkspaceData } from '../types';

const DEFAULT_WORKSPACE_ID = 'default';
const EMPTY_DATA: WorkspaceData = {
  projects: [],
  epics: [],
  stories: [],
  tasks: [],
  decisions: [],
  meetings: [],
  documents: [],
};

const collectionNames: CollectionName[] = [
  'projects',
  'epics',
  'stories',
  'tasks',
  'decisions',
  'meetings',
  'documents',
];

function getCollectionPath(uid: string, collectionName: CollectionName) {
  return `users/${uid}/workspaces/${DEFAULT_WORKSPACE_ID}/${collectionName}`;
}

function withAudit<T extends { id?: string }>(payload: T, uid: string) {
  const now = new Date().toISOString();
  return {
    ...payload,
    id: payload.id || crypto.randomUUID(),
    ownerUid: uid,
    workspaceId: DEFAULT_WORKSPACE_ID,
    updatedAt: now,
    createdAt: 'createdAt' in payload && typeof payload.createdAt === 'string' ? payload.createdAt : now,
  };
}

export function useWorkspaceData(user: User | null) {
  const [data, setData] = useState<WorkspaceData>(EMPTY_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uid = user?.uid;

  const refresh = useCallback(async () => {
    if (!uid || !db) return;
    setLoading(true);
    setError(null);
    try {
      const next: WorkspaceData = { ...EMPTY_DATA };
      for (const collectionName of collectionNames) {
        const snap = await getDocs(collection(db, getCollectionPath(uid, collectionName)));
        next[collectionName] = snap.docs.map((item) => item.data()) as never;
      }

      if (next.projects.length === 0) {
        const mock = buildMockData(uid);
        const batch = writeBatch(db);
        for (const collectionName of collectionNames) {
          for (const item of mock[collectionName]) {
            const itemRef = doc(db, getCollectionPath(uid, collectionName), item.id);
            batch.set(itemRef, item);
          }
        }
        await batch.commit();
        setData(mock);
      } else {
        setData(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '讀取資料失敗');
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    if (uid) refresh();
    else setData(EMPTY_DATA);
  }, [uid, refresh]);

  const saveItem = useCallback(
    async <T extends { id?: string }>(collectionName: CollectionName, payload: T) => {
      if (!uid || !db) throw new Error('尚未登入或 Firebase 尚未設定');
      const item = withAudit(payload, uid);
      await setDoc(doc(db, getCollectionPath(uid, collectionName), item.id), item, { merge: true });
      await refresh();
      return item.id;
    },
    [refresh, uid],
  );

  const deleteItem = useCallback(
    async (collectionName: CollectionName, id: string) => {
      if (!uid || !db) throw new Error('尚未登入或 Firebase 尚未設定');
      await deleteDoc(doc(db, getCollectionPath(uid, collectionName), id));
      await refresh();
    },
    [refresh, uid],
  );

  const resetWithMockData = useCallback(async () => {
    if (!uid || !db) return;
    const mock = buildMockData(uid);
    const batch = writeBatch(db);
    for (const collectionName of collectionNames) {
      const snap = await getDocs(collection(db, getCollectionPath(uid, collectionName)));
      snap.docs.forEach((item) => batch.delete(item.ref));
      for (const item of mock[collectionName]) {
        batch.set(doc(db, getCollectionPath(uid, collectionName), item.id), item);
      }
    }
    await batch.commit();
    await refresh();
  }, [refresh, uid]);

  const importData = useCallback(
    async (incoming: WorkspaceData) => {
      if (!uid || !db) return;
      const batch = writeBatch(db);
      for (const collectionName of collectionNames) {
        const snap = await getDocs(collection(db, getCollectionPath(uid, collectionName)));
        snap.docs.forEach((item) => batch.delete(item.ref));
        for (const rawItem of incoming[collectionName] || []) {
          const item = withAudit(rawItem, uid);
          batch.set(doc(db, getCollectionPath(uid, collectionName), item.id), item);
        }
      }
      await batch.commit();
      await refresh();
    },
    [refresh, uid],
  );

  const lookups = useMemo(() => {
    const projectMap = new Map(data.projects.map((project) => [project.id, project]));
    const epicMap = new Map(data.epics.map((epic) => [epic.id, epic]));
    const storyMap = new Map(data.stories.map((story) => [story.id, story]));
    return { projectMap, epicMap, storyMap };
  }, [data]);

  return {
    data,
    loading,
    error,
    refresh,
    saveItem,
    deleteItem,
    resetWithMockData,
    importData,
    lookups,
  };
}
