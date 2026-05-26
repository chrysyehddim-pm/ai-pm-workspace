import type { WorkspaceData } from '../types';

const now = new Date().toISOString();
const workspaceId = 'default';

const d = (offset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

export function buildMockData(ownerUid: string): WorkspaceData {
  return {
    projects: [
      {
        id: 'project-health',
        ownerUid,
        workspaceId,
        createdAt: now,
        updatedAt: now,
        name: '智慧健康服務平台',
        description: '個人 PM 工作台的驗證專案，用於管理跨部門需求、開發追蹤、法務確認、行銷與展會任務。',
        goal: '建立可追蹤、可回報、可沉澱的專案管理節奏。',
        status: '進行中',
        owner: 'Chrys',
        startDate: d(-30),
        targetDate: d(45),
        stakeholders: 'PM, TPM, IT, 法務, 品牌, 醫院合作窗口',
      },
      {
        id: 'project-template',
        ownerUid,
        workspaceId,
        createdAt: now,
        updatedAt: now,
        name: '下一個產品 / 專案範例',
        description: '用來驗證本工具不只適用於單一健康專案，也可支援未來多專案管理。',
        goal: '確認 Project / Epic / Story / Task 結構可複用。',
        status: '尚未開始',
        owner: 'Chrys',
      },
    ],
    epics: [
      { id: 'epic-test', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '遊戲封閉測試', goal: '完成內部員工與親友測試流程', status: '進行中' },
      { id: 'epic-group', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '群組功能', goal: '完成家庭群組核心流程', status: '進行中' },
      { id: 'epic-content', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '衛教文章授權', goal: '確認來源、授權與展示方式', status: '待確認' },
      { id: 'epic-brand', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '品牌行銷', goal: '對齊主視覺與上市溝通節奏', status: '需協調' },
      { id: 'epic-event', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '展會活動', goal: '規劃現場展示與互動流程', status: '尚未開始' },
    ],
    stories: [
      { id: 'story-test-copy', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-test', title: '完成遊戲測試入口頁說明', description: '補齊遊戲紀錄保持、測試獎勵與參與資格說明。', value: '降低測試者誤解與客服溝通成本。' },
      { id: 'story-group-exit', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-group', title: '使用者可退出群組', description: '退出群組後需回到尚未建立群組狀態。', value: '維持群組流程完整性。' },
      { id: 'story-content-source', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-content', title: '衛教文章顯示資料來源', description: '於區塊標題旁補上資料來源文字。', value: '降低授權與來源辨識風險。' },
    ],
    tasks: [
      { id: 'task-1', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-test', storyId: 'story-test-copy', title: '補上同手機號碼遊戲紀錄保持說明', description: '在入口頁文案中加入同一手機號碼會保留遊玩紀錄。', assignee: 'Chrys', department: 'PM', status: '需修改', tags: ['待追蹤'], priority: '高', dueDate: d(2), source: 'Personal Note', notes: '法務建議需說明更精準。' },
      { id: 'task-2', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-group', storyId: 'story-group-exit', title: '確認退出群組按鈕行為', description: '退出後應回到初始畫面，不應無反應。', assignee: 'Peter', department: 'IT', status: '待確認', tags: ['需協調', '待追蹤'], priority: '高', dueDate: d(3), source: 'Teams', notes: '需確認前端狀態切換。' },
      { id: 'task-3', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-content', storyId: 'story-content-source', title: '新增資料來源：亞東醫院提供', description: '最低幅度調整衛教文章標題區塊文字。', assignee: 'Chrys', department: 'PM', status: '完成', tags: [], priority: '中', dueDate: d(-1), source: 'Personal Note' },
      { id: 'task-4', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-brand', title: '與 Jerry 對齊品牌行銷計畫', description: '討論上市前後品牌識別與行銷節奏。', assignee: 'Jerry', department: '品牌 / PR', status: '尚未開始', tags: ['需協調'], priority: '高', dueDate: d(5), source: 'Meeting' },
    ],
    decisions: [
      { id: 'decision-1', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', date: d(-4), decisionMaker: '主管', content: '遊戲封閉測試先採內部同事與親友測試，不走問卷部門發送流程。', context: '降低開發與流程複雜度，先快速取得難度校準資料。', impact: '影響測試招募與獎勵規則說明。', source: 'Meeting' },
      { id: 'decision-2', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', date: d(-2), decisionMaker: 'PM', content: '衛教文章區塊先採最低幅度調整，只新增資料來源文字。', context: '避免改動過大造成開發風險。', impact: '影響 HTML 文案調整。', source: 'Personal Note' },
    ],
    meetings: [
      { id: 'meeting-1', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', title: '智慧健康專案雙週會', date: d(-3), participants: 'PM, TPM, IT, 法務', summary: '確認封測規則、法務文案與群組功能待修正事項。', actionItems: 'Peter 確認退出群組流程；Chrys 更新測試入口頁文案。', openQuestions: '是否需要調整展會背板素材。', decisions: '封測先以內部同事與親友測試。' },
    ],
    documents: [
      { id: 'doc-1', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-test', name: '[進度報告]智慧健康服務平台專案_0526.pptx', type: 'PPT', path: 'P:\\智慧健康服務平台專案\\01. 專案管理與控管\\月會\\202605\\[進度報告]智慧健康服務平台專案_0526.pptx', versionNote: '月會報告版', purpose: '主管回報', lastUpdated: d(-1) },
      { id: 'doc-2', ownerUid, workspaceId, createdAt: now, updatedAt: now, projectId: 'project-health', epicId: 'epic-group', name: '群組功能規格.xlsx', type: 'Excel', path: 'P:\\智慧健康服務平台專案\\04. 規劃與提案\\產品功能提案\\群組功能規格.xlsx', versionNote: 'SIT 前規格', purpose: '規格', lastUpdated: d(-5) },
    ],
  };
}
