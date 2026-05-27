# AI PM Workspace v0.1.2 Patch

本次修正重點：

1. 補齊可編輯能力
   - Project 可編輯基本資料
   - Epic 可編輯
   - Story 可編輯
   - Decision Log 可編輯
   - Meeting Notes 可編輯
   - Document Index 可編輯

2. 介面命名一致化
   - 側邊欄改為繁體中文
   - 頁面標題統一繁體中文
   - 保留 AI PM Workspace 作為產品名稱

3. Report 邏輯說明
   - 報告中心明確說明是「即時草稿產生器」
   - 不會每日自動生成
   - 不會自動保存歷史版本
   - 若需保存版本，請複製後另存

4. 輕量 UI/UX 優化
   - 側邊欄加入簡單 icon 識別
   - 手機底部導覽加入 icon
   - 編輯 / 刪除操作改為更明確的按鈕樣式
   - 空資料狀態增加提示

使用方式：
請將 zip 內檔案依照相同路徑覆蓋到 GitHub repo。
例如：
- src/pages/Projects.tsx 覆蓋 repo 中的 src/pages/Projects.tsx
- src/components/Layout.tsx 覆蓋 repo 中的 src/components/Layout.tsx

覆蓋後 commit，GitHub Actions 會自動部署。
