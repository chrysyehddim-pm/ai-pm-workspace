# AI PM Workspace v0.1.1 Patch

請將本壓縮檔內的檔案依照相同路徑上傳到 GitHub repo，覆蓋既有檔案。

## 這版修正

1. 「重置範例資料」改為「補上範例資料」，不再刪除既有資料。
2. 匯入資料前會跳出確認，提醒匯入會覆蓋目前資料。
3. 刪除 Project / Epic / Story / Task / Decision / Meeting / Document 前會跳出確認。
4. Task 可只掛 Project，Epic / Story 改為選填。
5. Project / Epic / Story 狀態與進度改為依底下 Task 自動推算。
6. Dashboard、Projects、Reports 改用推算後的狀態與進度。
7. 補上 src/vite-env.d.ts，避免 Vite env 型別錯誤。

## 覆蓋檔案

- src/App.tsx
- src/types.ts
- src/vite-env.d.ts
- src/components/Layout.tsx
- src/components/TaskForm.tsx
- src/hooks/useWorkspaceData.ts
- src/pages/Dashboard.tsx
- src/pages/Projects.tsx
- src/utils/projectMetrics.ts
- src/utils/reportGenerator.ts

