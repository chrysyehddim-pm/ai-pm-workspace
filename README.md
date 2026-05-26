# AI PM Workspace

AI PM Workspace 是一套給個人 PM 使用的專案任務追蹤工作台，協助整理多專案、多工作流、多任務、多決策紀錄、會議紀錄與文件索引。

此版本不是公司級專案管理系統，也不是 Jira / Shortcut / Height 的替代品。v0.1 聚焦在個人 PM 的任務追蹤、決策沉澱與回報整理。

---

## v0.1 Scope

### Included

- React + TypeScript + Vite
- Tailwind CSS RWD layout
- Firebase Authentication
- Cloud Firestore
- 個人資料隔離 Security Rules
- Project / Epic / Story / Task
- Task Center
- Decision Log
- Meeting Notes
- Document Index
- Report Generator
- JSON backup export / import

### Not Included

- 檔案上傳
- AI API 串接
- 多人協作
- 權限分享
- Teams / Email 串接
- 甘特圖

---

## Core Structure

```text
Workspace
└── Project
    └── Epic
        └── Story
            └── Task
```

---

## Firebase Data Path

```text
users/{uid}/workspaces/default/projects/{projectId}
users/{uid}/workspaces/default/epics/{epicId}
users/{uid}/workspaces/default/stories/{storyId}
users/{uid}/workspaces/default/tasks/{taskId}
users/{uid}/workspaces/default/decisions/{decisionId}
users/{uid}/workspaces/default/meetings/{meetingId}
users/{uid}/workspaces/default/documents/{documentId}
```

Firestore rules are defined in `firestore.rules`.

---

## Setup

### 1. Create Firebase Project

In Firebase Console:

1. Create a Firebase project.
2. Add a Web App.
3. Enable Authentication.
4. Enable Google Sign-In and/or Anonymous Sign-In.
5. Create Cloud Firestore.
6. Enable Firebase Hosting if you want to deploy through Firebase.

### 2. Environment Variables

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

Fill in your Firebase Web App config:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

If you are using GitHub Actions, set the same values as repository secrets.

### 3. Install

```bash
npm install
```

### 4. Run Locally

```bash
npm run dev
```

### 5. Build

```bash
npm run build
```

---

## GitHub.dev Workflow

If your company computer cannot install Node.js or VS Code, you can still edit files using GitHub's web editor:

1. Upload this project to a GitHub repository.
2. Press `.` inside the repo page, or open `https://github.dev/{owner}/{repo}`.
3. Edit files in the browser.
4. Commit changes.
5. Let GitHub Actions build and deploy, or deploy from a personal computer.

---

## Firebase Hosting with GitHub Actions

This repo includes an example workflow file:

```text
.github/workflows/firebase-hosting.yml.example
```

After setting GitHub repository secrets, rename it to:

```text
.github/workflows/firebase-hosting.yml
```

Required secrets:

- `FIREBASE_SERVICE_ACCOUNT`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Security Notes

- Do not upload company confidential documents to this app.
- v0.1 only stores document indexes, not actual files.
- Firebase API config is not the main security layer; Firestore Security Rules are.
- Current rules allow each authenticated user to read/write only their own `/users/{uid}` data.

---

## Development Roadmap

### v0.1

- Cloud MVP
- Personal login
- Firestore sync
- Core PM workspace modules

### v0.2

- Better search and filters
- Markdown export
- Mobile quick-add improvements
- Better report templates

### v0.3

- AI prompt templates
- Meeting notes to task prompt
- Manual AI-assisted workflow

### v1.0

- Consider AI API integration
- Consider limited collaboration
- Consider attachment support only after security review
