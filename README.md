# LocalSnap Tools

> v1.0.3：移除 package-lock.json，避免 Vercel 讀到非公開 npm registry 造成安裝失敗。

LocalSnap Tools 是一個 **純前端、本機瀏覽器處理** 的私人檔案工具箱。你可以把專案放到 GitHub，再部署到 Vercel 或 GitHub Pages；使用時檔案只在瀏覽器本機讀取與處理，不上傳、不存雲端、不需要登入。

## 目前功能

### 1. PDF 工具
- PDF 安全優化：保留文字可選取性，重新封裝 PDF 並移除部分中繼資料。
- PDF 圖片化高壓縮：將 PDF 頁面渲染為圖片後重建 PDF，壓縮效果較明顯，但文字會變成圖片。
- 多 PDF 合併。

> PDF 壓縮效果會受原始 PDF 影響。若原檔已高度壓縮，安全優化可能只會小幅縮小。

### 2. 圖片工具
- JPG / PNG / WebP 壓縮。
- JPG / PNG / WebP 格式轉換。
- 自訂寬高、等比例縮放。
- 常用尺寸：16:9、1:1、4:3、縮圖。
- 批次處理與 ZIP 下載。
- 自訂輸出檔名前綴。

### 3. PPTX 壓縮
- 讀取 `.pptx` 內的圖片檔。
- 依最大邊長縮小圖片。
- 重新壓縮 JPEG / WebP / PNG 圖片。
- 保留 PPTX 結構，另存新檔。

> 目前支援 `.pptx`，不支援舊版 `.ppt`。壓縮後請打開檢查版面。

### 4. 純色背景去背
- 將 JPG / PNG / WebP 的純色背景轉為透明。
- 輸出透明 PNG。
- 適合白底商品圖、icon、截圖素材。

> 這不是 AI 去背。複雜背景、髮絲、陰影、透明物件效果有限。

## 隱私設計

本專案刻意不建立後端檔案處理流程：

- 不建立資料庫。
- 不建立檔案上傳 API。
- 不使用雲端儲存。
- 不需要帳號登入。
- 不預設加入 Google Analytics 或第三方追蹤碼。
- 檔案透過瀏覽器 File API 讀取，處理後用 Blob 產生下載檔。

你可以用瀏覽器 DevTools 的 Network 面板確認：處理檔案時不應出現檔案上傳請求。

## 本機執行

請先安裝 Node.js 18 以上版本。

```bash
npm install
npm run dev
```

開啟：

```text
http://localhost:3000
```

## 建置靜態網站

```bash
npm run build
```

此專案已在 `next.config.mjs` 設定：

```js
output: 'export'
```

Build 後會產出 `out/` 資料夾，可部署到支援靜態網站的服務。

## 部署到 Vercel

建議流程：

1. 建立 GitHub repository。
2. 將本專案所有檔案上傳到 GitHub。
3. 到 Vercel 建立新專案。
4. 連接 GitHub repository。
5. Framework Preset 選 Next.js。
6. Build Command 使用預設 `next build`。
7. 部署完成後取得網址。

## 部署到 GitHub Pages

因為本專案是靜態輸出，也可部署到 GitHub Pages。你可以使用 GitHub Actions 將 `out/` 資料夾發布到 Pages。

如果你想先降低操作複雜度，建議第一版先用 Vercel。

## 建議驗收方式

部署完成後，請做以下測試：

1. 開啟 DevTools → Network。
2. 選擇一張圖片並壓縮。
3. 確認 Network 沒有出現檔案上傳 request。
4. 下載輸出檔，確認可正常開啟。
5. 測試 PDF、PPTX 後也同樣檢查 Network。

## 後續可擴充

- PWA 離線模式。
- MP3 / MP4 壓縮與裁切。
- AI 本機去背模型。
- PDF 拆分、刪頁、圖片轉 PDF。
- 工具使用紀錄只存在 localStorage，不同步雲端。

