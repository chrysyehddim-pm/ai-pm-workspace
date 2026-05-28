export type PageKey =
  | 'dashboard'
  | 'projects'
  | 'tasks'
  | 'decisions'
  | 'meetings'
  | 'documents'
  | 'reports';

export type TaskStatus =
  | '待整理'
  | '尚未開始'
  | '進行中'
  | '待確認'
  | '需修改'
  | '暫緩'
  | '完成';

export type TaskTag = '需協調' | '待追蹤' | '高優先';
export type Priority = '低' | '中' | '高';
export type ProjectStatus =
  | '待整理'
  | '尚未開始'
  | '進行中'
  | '待確認'
  | '需修改'
  | '需協調'
  | '暫緩'
  | '完成';
export type SourceType = 'Meeting' | 'Teams' | 'Email' | 'Line' | 'Personal Note' | 'Other';
export type DocumentType = 'PPT' | 'Excel' | 'Word' | 'PDF' | 'Image' | 'Link' | 'Other';
export type ReportType = '週報' | '月報' | '會議摘要' | '主管摘要';
export type TaskHistoryType = '討論' | '修改' | '追蹤' | '決策' | '備註';

export interface BaseEntity {
  id: string;
  ownerUid: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project extends BaseEntity {
  name: string;
  description: string;
  goal: string;
  status: ProjectStatus;
  owner: string;
  startDate?: string;
  targetDate?: string;
  stakeholders?: string;
}

export interface Epic extends BaseEntity {
  projectId: string;
  title: string;
  goal: string;
  status: ProjectStatus;
}

export interface Story extends BaseEntity {
  projectId: string;
  epicId: string;
  title: string;
  description: string;
  value?: string;
}

export interface TaskHistory {
  id: string;
  type: TaskHistoryType;
  content: string;
  createdAt: string;
  createdBy?: string;
}

export interface Task extends BaseEntity {
  projectId: string;
  epicId?: string;
  storyId?: string;
  title: string;
  summary?: string;
  description?: string;
  assignee?: string;
  department?: string;
  status: TaskStatus;
  tags: TaskTag[];
  priority: Priority;
  dueDate?: string;
  source: SourceType;
  notes?: string;
  history?: TaskHistory[];
}

export interface Decision extends BaseEntity {
  projectId: string;
  relatedTaskId?: string;
  date: string;
  decisionMaker: string;
  content: string;
  context?: string;
  impact?: string;
  source: SourceType;
}

export interface MeetingNote extends BaseEntity {
  projectId: string;
  title: string;
  date: string;
  participants?: string;
  rawNotes?: string;
  summary?: string;
  actionItems?: string;
  openQuestions?: string;
  decisions?: string;
}

export interface DocumentIndex extends BaseEntity {
  projectId: string;
  epicId?: string;
  name: string;
  type: DocumentType;
  path: string;
  versionNote?: string;
  purpose?: string;
  lastUpdated?: string;
}

export interface WorkspaceData {
  projects: Project[];
  epics: Epic[];
  stories: Story[];
  tasks: Task[];
  decisions: Decision[];
  meetings: MeetingNote[];
  documents: DocumentIndex[];
}

export type CollectionName = keyof WorkspaceData;
