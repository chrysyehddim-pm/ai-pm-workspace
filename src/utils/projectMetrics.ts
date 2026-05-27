import type { ProjectStatus, Task, WorkspaceData } from '../types';

const ACTIVE_STATUSES = ['進行中', '待確認', '需修改'] as const;
const INITIAL_STATUSES = ['待整理', '尚未開始'] as const;

export function getProjectTasks(data: WorkspaceData, projectId: string) {
  return data.tasks.filter((task) => task.projectId === projectId);
}

export function getEpicTasks(data: WorkspaceData, epicId: string) {
  return data.tasks.filter((task) => task.epicId === epicId);
}

export function getStoryTasks(data: WorkspaceData, storyId: string) {
  return data.tasks.filter((task) => task.storyId === storyId);
}

export function deriveStatusFromTasks(tasks: Task[]): ProjectStatus {
  if (tasks.length === 0) return '尚未開始';

  if (tasks.every((task) => task.status === '完成')) return '完成';

  const unfinished = tasks.filter((task) => task.status !== '完成');

  if (unfinished.length > 0 && unfinished.every((task) => task.status === '暫緩')) {
    return '暫緩';
  }

  if (tasks.some((task) => ACTIVE_STATUSES.includes(task.status as (typeof ACTIVE_STATUSES)[number]))) {
    return '進行中';
  }

  if (tasks.every((task) => INITIAL_STATUSES.includes(task.status as (typeof INITIAL_STATUSES)[number]))) {
    return '尚未開始';
  }

  return '進行中';
}

export function getCompletionMetrics(tasks: Task[]) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === '完成').length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percent };
}

export function getAttentionMetrics(tasks: Task[]) {
  const unfinished = tasks.filter((task) => task.status !== '完成');
  return {
    coordination: unfinished.filter((task) => task.tags.includes('需協調')).length,
    review: unfinished.filter((task) => task.status === '待確認').length,
    followUp: unfinished.filter((task) => task.tags.includes('待追蹤')).length,
    highPriority: unfinished.filter((task) => task.tags.includes('高優先')).length,
  };
}

export function getProjectSummary(data: WorkspaceData, projectId: string) {
  const tasks = getProjectTasks(data, projectId);
  return {
    tasks,
    status: deriveStatusFromTasks(tasks),
    completion: getCompletionMetrics(tasks),
    attention: getAttentionMetrics(tasks),
  };
}

export function getEpicSummary(data: WorkspaceData, epicId: string) {
  const tasks = getEpicTasks(data, epicId);
  return {
    tasks,
    status: deriveStatusFromTasks(tasks),
    completion: getCompletionMetrics(tasks),
    attention: getAttentionMetrics(tasks),
  };
}

export function getStorySummary(data: WorkspaceData, storyId: string) {
  const tasks = getStoryTasks(data, storyId);
  return {
    tasks,
    status: deriveStatusFromTasks(tasks),
    completion: getCompletionMetrics(tasks),
    attention: getAttentionMetrics(tasks),
  };
}
