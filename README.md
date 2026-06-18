# AI PM Workspace

AI PM Workspace 是一套給個人 PM 使用的專案任務追蹤工作台，用來管理多專案、多工作流、多任務、多決策紀錄、會議紀錄與文件索引。

目前版本：v0.1.3

## 產品定位

這不是公司級專案管理系統，也不是 Jira / Shortcut / Height 的替代品。第一階段聚焦在個人 PM 的工作效率：

- 任務追蹤
- 決策沉澱
- 會議紀錄
- 文件索引
- 報告草稿
- 多裝置雲端同步

## 技術架構

- Vite
- React
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- GitHub Actions deployment

## v0.1.3 功能重點

- Google 登入與匿名登入
- Firestore 雲端資料儲存
- Project / Epic / Story / Task 架構
- Task 可只掛 Project，Epic / Story 選填
- Project 狀態與進度由 Task 自動推算
- 任務中心簡潔列表
- 任務狀態可直接在列表切換
- 任務獨立詳情頁
- 任務歷程紀錄，支援 Markdown-ready 純文字
- Dashboard 任務 / 決策 / 專案可點擊導向詳情
- 決策紀錄、會議紀錄、文件索引、報告中心
- 匯出 / 匯入 JSON
- 補上範例資料不會刪除既有資料

## 環境變數

請在 GitHub Actions Secrets 設定：

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_SERVICE_ACCOUNT`

## Firebase Security Rules

目前 Firestore 規則採個人資料隔離：

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 本機開發

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## 部署

Push 到 `main` 後，GitHub Actions 會自動 build 並部署到 Firebase Hosting。

## 後續 Roadmap

### v0.1.4

- 文件索引、會議紀錄、報告中心支援多專案情境
- 全域情境篩選器：全部專案 / 指定專案 / 指定 Epic / 日期區間

### v0.1.5

- Markdown-lite 編輯器
- Markdown 預覽
- 常用格式按鈕

### v0.2

- 搜尋
- 會議紀錄轉任務 / 決策的手動輔助流程
- 報告範圍設定與匯出格式優化
