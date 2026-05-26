import type { ReportType, WorkspaceData } from '../types';

function bullet(items: string[]) {
  if (items.length === 0) return '- 暫無';
  return items.map((item) => `- ${item}`).join('\n');
}

export function generateReport(type: ReportType, data: WorkspaceData) {
  const today = new Date().toISOString().slice(0, 10);
  const activeTasks = data.tasks.filter((task) => task.status !== '完成');
  const doneTasks = data.tasks.filter((task) => task.status === '完成');
  const coordinationTasks = data.tasks.filter((task) => task.tags.includes('需協調'));
  const reviewTasks = data.tasks.filter((task) => task.status === '待確認');
  const followUpTasks = data.tasks.filter((task) => task.tags.includes('待追蹤'));
  const recentDecisions = [...data.decisions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  if (type === '週報') {
    return `【AI PM Workspace 週報草稿】\n日期：${today}\n\n一、本週完成\n${bullet(doneTasks.slice(0, 8).map((task) => `${task.title}（${task.assignee || '未填負責人'}）`))}\n\n二、進行中 / 待追蹤\n${bullet(activeTasks.slice(0, 8).map((task) => `${task.title}｜${task.status}｜${task.assignee || '未填負責人'}`))}\n\n三、需協調事項\n${bullet(coordinationTasks.slice(0, 8).map((task) => `${task.title}｜${task.assignee || '未填負責人'}｜${task.notes || '待補充'}`))}\n\n四、下週重點\n${bullet(followUpTasks.slice(0, 8).map((task) => `${task.title}（目標日：${task.dueDate || '未設定'}）`))}`;
  }

  if (type === '月報') {
    return `【AI PM Workspace 月報草稿】\n日期：${today}\n\n一、本月專案概況\n${bullet(data.projects.map((project) => `${project.name}｜${project.status}｜${project.goal}`))}\n\n二、主要成果\n${bullet(doneTasks.slice(0, 10).map((task) => task.title))}\n\n三、主要需協調事項\n${bullet(coordinationTasks.slice(0, 10).map((task) => `${task.title}｜${task.assignee || '未填負責人'}`))}\n\n四、重要決策紀錄\n${bullet(recentDecisions.map((decision) => `${decision.date}｜${decision.decisionMaker}：${decision.content}`))}\n\n五、下月重點\n${bullet(activeTasks.slice(0, 10).map((task) => `${task.title}｜${task.status}`))}`;
  }

  if (type === '會議摘要') {
    const latestMeeting = [...data.meetings].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (!latestMeeting) return '目前尚無會議紀錄。';
    return `【會議摘要草稿】\n會議：${latestMeeting.title}\n日期：${latestMeeting.date}\n參與者：${latestMeeting.participants || '未填'}\n\n一、會議重點\n${latestMeeting.summary || '待補充'}\n\n二、行動項目\n${latestMeeting.actionItems || '待補充'}\n\n三、待確認事項\n${latestMeeting.openQuestions || '暫無'}\n\n四、決策事項\n${latestMeeting.decisions || '暫無'}`;
  }

  return `【主管摘要草稿】\n日期：${today}\n\n1. 目前共有 ${data.projects.length} 個專案、${activeTasks.length} 個未完成任務需要追蹤。\n2. 需協調事項共 ${coordinationTasks.length} 項，主要集中在跨部門確認或外部依賴。\n3. 待確認事項共 ${reviewTasks.length} 項，建議優先確認是否影響時程。\n4. 最近重要決策：${recentDecisions[0]?.content || '暫無'}\n5. 下階段建議聚焦於高優先任務與需協調事項的排除。`;
}
