# AI PM Workspace v0.1.3 Patch

本 patch 聚焦「任務中心工作流優化 + Markdown-ready 資料結構」。

## 覆蓋檔案

請依照相同路徑覆蓋 GitHub repo 內檔案：

- `src/App.tsx`
- `src/types.ts`
- `src/hooks/useWorkspaceData.ts`
- `src/components/TaskForm.tsx`
- `src/pages/TaskCenter.tsx`
- `src/pages/Dashboard.tsx`
- `src/pages/DecisionLog.tsx`
- `src/pages/Projects.tsx`

## 本次修正重點

1. 任務中心列表簡潔化：列表只顯示任務標題、摘要、專案、負責人、狀態、標籤與日期。
2. 任務狀態可在列表直接切換，不必進入編輯頁。
3. 任務詳情獨立化：點擊任務後進入詳情，不再在編輯區下方顯示其他任務列表。
4. 任務詳情新增「歷程紀錄」，可記錄討論、修改、追蹤、決策、備註，並自動加日期戳記。
5. 任務描述與歷程紀錄欄位採 Markdown-ready 純文字設計，後續可升級 Markdown 預覽。
6. 首頁總覽的任務與決策可點擊進入對應詳情。
7. 修正 `saveItem` 在局部更新時覆蓋 createdAt 的問題。
8. 專案概況卡片可從首頁進入專案管理頁並選中該專案。

## 驗收建議

- 在任務中心直接切換任務狀態，確認 Firestore 有保存。
- 點任務進入詳情，確認下方不再顯示其他任務列表。
- 新增一筆任務歷程紀錄，重新整理後確認資料仍存在。
- 從首頁點「本週待追 / 需協調事項」任務，確認能進入該任務詳情。
- 從首頁點「最近決策」，確認能進入該決策詳情。
- GitHub Actions 應可成功 build。
