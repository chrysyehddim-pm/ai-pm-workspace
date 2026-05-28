'use client';

import { useMemo, useState } from 'react';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

type ToolKey = 'image' | 'pdf' | 'ppt' | 'bg';

type ProcessedFile = {
  name: string;
  blob: Blob;
  originalSize: number;
  newSize: number;
  width?: number;
  height?: number;
  previewUrl?: string;
  note?: string;
};

const PRESETS = [
  { label: '不套用', value: 'none', width: 0, height: 0 },
  { label: '16:9 簡報圖 1920×1080', value: '16-9', width: 1920, height: 1080 },
  { label: '1:1 社群圖 1080×1080', value: '1-1', width: 1080, height: 1080 },
  { label: '4:3 文件圖 1600×1200', value: '4-3', width: 1600, height: 1200 },
  { label: '縮圖 800×800', value: 'thumb', width: 800, height: 800 }
];

const QUALITY_PRESETS = {
  high: 0.88,
  balanced: 0.72,
  small: 0.52
};

function formatBytes(bytes: number) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fff.]/g, '_');
}

function baseName(name: string) {
  return safeName(name.replace(/\.[^/.]+$/, ''));
}

function extensionFromMime(mime: string) {
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'bin';
}

function mimeFromOutput(output: string, file: File) {
  if (output === 'original') {
    if (file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg') return file.type;
    return 'image/jpeg';
  }
  if (output === 'jpg') return 'image/jpeg';
  if (output === 'png') return 'image/png';
  if (output === 'webp') return 'image/webp';
  return 'image/jpeg';
}


function uint8ToArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function loadImage(source: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('圖片讀取失敗，請確認格式是否支援。'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error('檔案輸出失敗。'));
      else resolve(blob);
    }, mime, quality);
  });
}

function getTargetSize(
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  keepRatio: boolean
) {
  if (!targetWidth && !targetHeight) return { width: originalWidth, height: originalHeight };

  if (!keepRatio) {
    return {
      width: targetWidth || originalWidth,
      height: targetHeight || originalHeight
    };
  }

  if (targetWidth && !targetHeight) {
    return { width: targetWidth, height: Math.round((originalHeight * targetWidth) / originalWidth) };
  }

  if (!targetWidth && targetHeight) {
    return { width: Math.round((originalWidth * targetHeight) / originalHeight), height: targetHeight };
  }

  const ratio = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
  return {
    width: Math.round(originalWidth * ratio),
    height: Math.round(originalHeight * ratio)
  };
}

function drawImageToCanvas(image: HTMLImageElement, width: number, height: number, mime: string) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('瀏覽器不支援 Canvas。');

  if (mime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, 0, 0, width, height);
  return canvas;
}

async function downloadZip(files: ProcessedFile[], zipName: string) {
  const zip = new JSZip();
  files.forEach((file) => zip.file(file.name, file.blob));
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, zipName);
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function compressionRatio(original: number, next: number) {
  if (!original) return '—';
  const diff = ((original - next) / original) * 100;
  return `${diff >= 0 ? '↓' : '↑'} ${Math.abs(diff).toFixed(1)}%`;
}

export default function Home() {
  const [active, setActive] = useState<ToolKey>('image');

  return (
    <main className="container">
      <section className="hero">
        <div className="hero-main">
          <span className="badge">⚡ Browser-only / 不上傳檔案</span>
          <h1>LocalSnap Tools</h1>
          <p className="subtitle">
            一個可放上 GitHub 與 Vercel 的私人檔案工具箱。檔案只在你的瀏覽器本機讀取與處理，不需要登入、不建立資料庫、不設計任何上傳 API。
          </p>
        </div>
        <div className="privacy-card">
          <div>
            <h2>隱私設計原則</h2>
            <p>這個專案刻意採用純前端架構。網站提供工具介面與程式碼，實際檔案處理在你的裝置上完成。</p>
          </div>
          <div className="check-list">
            <div className="check-item"><span className="dot">✓</span>不存檔案到雲端</div>
            <div className="check-item"><span className="dot">✓</span>不建立後端 API</div>
            <div className="check-item"><span className="dot">✓</span>不需要帳號登入</div>
          </div>
        </div>
      </section>

      <section className="tool-grid">
        <div className="tool-card"><strong>PDF 優化 / 合併</strong><span>支援保留文字的基礎優化、圖片化高壓縮與多 PDF 合併。</span></div>
        <div className="tool-card"><strong>圖片壓縮 / 改尺寸</strong><span>支援 JPG、PNG、WebP，含常用尺寸與批次 ZIP 下載。</span></div>
        <div className="tool-card"><strong>PPTX 壓縮</strong><span>壓縮簡報內嵌圖片，特別適合圖多的簡報檔。</span></div>
        <div className="tool-card"><strong>純色背景去背</strong><span>針對白底或純色背景做透明 PNG，不使用雲端 AI。</span></div>
      </section>

      <nav className="tabs" aria-label="工具切換">
        <button className={`tab ${active === 'pdf' ? 'active' : ''}`} onClick={() => setActive('pdf')}>PDF 工具</button>
        <button className={`tab ${active === 'image' ? 'active' : ''}`} onClick={() => setActive('image')}>圖片工具</button>
        <button className={`tab ${active === 'ppt' ? 'active' : ''}`} onClick={() => setActive('ppt')}>PPTX 壓縮</button>
        <button className={`tab ${active === 'bg' ? 'active' : ''}`} onClick={() => setActive('bg')}>純色去背</button>
      </nav>

      {active === 'pdf' && <PdfTool />}
      {active === 'image' && <ImageTool />}
      {active === 'ppt' && <PptTool />}
      {active === 'bg' && <BackgroundTool />}

      <p className="footer-note">
        提醒：這是本機瀏覽器工具，不適合處理超大檔案。若公司文件極度敏感，仍建議在可信任網路與個人電腦環境使用，並可用 DevTools Network 檢查是否有檔案上傳請求。
      </p>
    </main>
  );
}

function ImageTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState('webp');
  const [qualityMode, setQualityMode] = useState<'high' | 'balanced' | 'small' | 'custom'>('balanced');
  const [quality, setQuality] = useState(72);
  const [preset, setPreset] = useState('none');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [keepRatio, setKeepRatio] = useState(true);
  const [prefix, setPrefix] = useState('localsnap_');
  const [results, setResults] = useState<ProcessedFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const qualityValue = qualityMode === 'custom' ? quality / 100 : QUALITY_PRESETS[qualityMode];

  function onPresetChange(value: string) {
    setPreset(value);
    const selected = PRESETS.find((item) => item.value === value);
    if (selected && selected.value !== 'none') {
      setWidth(String(selected.width));
      setHeight(String(selected.height));
      setKeepRatio(true);
    }
  }

  async function processImages() {
    if (!files.length) {
      setMessage('請先選擇圖片。');
      return;
    }
    setBusy(true);
    setMessage('圖片處理中，請保持頁面開啟。');

    try {
      const nextResults: ProcessedFile[] = [];
      for (const file of files) {
        const image = await loadImage(file);
        const target = getTargetSize(
          image.naturalWidth,
          image.naturalHeight,
          Number(width) || 0,
          Number(height) || 0,
          keepRatio
        );
        const mime = mimeFromOutput(output, file);
        const canvas = drawImageToCanvas(image, target.width, target.height, mime);
        const blob = await canvasToBlob(canvas, mime, qualityValue);
        const ext = extensionFromMime(mime);
        const name = `${safeName(prefix)}${baseName(file.name)}.${ext}`;
        nextResults.push({
          name,
          blob,
          originalSize: file.size,
          newSize: blob.size,
          width: target.width,
          height: target.height,
          previewUrl: URL.createObjectURL(blob)
        });
      }
      setResults(nextResults);
      setMessage(`完成 ${nextResults.length} 個檔案。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '圖片處理失敗。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <div>
          <h2>圖片壓縮、改尺寸與轉檔</h2>
          <p>支援 JPG、PNG、WebP。適合處理截圖、簡報圖、社群圖與一般產品素材。</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>選擇圖片，可多選</label>
          <input className="file-input" type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </div>
        <div className="field">
          <label>輸出格式</label>
          <select value={output} onChange={(e) => setOutput(e.target.value)}>
            <option value="original">保持原格式</option>
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
          </select>
        </div>
        <div className="field">
          <label>壓縮模式</label>
          <select value={qualityMode} onChange={(e) => setQualityMode(e.target.value as 'high' | 'balanced' | 'small' | 'custom')}>
            <option value="high">高品質</option>
            <option value="balanced">平衡</option>
            <option value="small">最小檔案</option>
            <option value="custom">自訂滑桿</option>
          </select>
        </div>
        <div className="field">
          <label>自訂品質：{quality}</label>
          <input type="range" min="20" max="95" value={quality} disabled={qualityMode !== 'custom'} onChange={(e) => setQuality(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>常用尺寸</label>
          <select value={preset} onChange={(e) => onPresetChange(e.target.value)}>
            {PRESETS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label>寬度 px</label>
          <input type="number" min="1" placeholder="例如 1920" value={width} onChange={(e) => { setPreset('none'); setWidth(e.target.value); }} />
        </div>
        <div className="field">
          <label>高度 px</label>
          <input type="number" min="1" placeholder="例如 1080" value={height} onChange={(e) => { setPreset('none'); setHeight(e.target.value); }} />
        </div>
        <div className="field">
          <span className="label">尺寸規則</span>
          <label className="inline"><input type="checkbox" checked={keepRatio} onChange={(e) => setKeepRatio(e.target.checked)} />等比例縮放</label>
        </div>
        <div className="field">
          <label>輸出檔名前綴</label>
          <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} />
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={processImages} disabled={busy}>處理圖片</button>
        <button className="secondary" onClick={() => downloadZip(results, 'localsnap_images.zip')} disabled={!results.length}>下載 ZIP</button>
        <button className="ghost" onClick={() => { setFiles([]); setResults([]); setMessage(''); }}>清空</button>
      </div>

      {message && <div className={`notice ${message.startsWith('完成') ? 'ok' : ''}`}>{message}</div>}
      <ResultList results={results} />
    </section>
  );
}

function PdfTool() {
  const [singlePdf, setSinglePdf] = useState<File | null>(null);
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [visualMode, setVisualMode] = useState<'small' | 'balanced' | 'high'>('balanced');
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const visualSettings = useMemo(() => {
    if (visualMode === 'small') return { scale: 0.9, quality: 0.55, label: '小檔優先' };
    if (visualMode === 'high') return { scale: 1.5, quality: 0.82, label: '清晰優先' };
    return { scale: 1.15, quality: 0.7, label: '平衡' };
  }, [visualMode]);

  async function optimizePdf() {
    if (!singlePdf) return setMessage('請先選擇 PDF。');
    setBusy(true);
    setMessage('正在進行安全優化，會保留文字可選取性，但壓縮幅度取決於原始 PDF。');
    try {
      const doc = await PDFDocument.load(await singlePdf.arrayBuffer(), { ignoreEncryption: true });
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setProducer('LocalSnap Tools');
      const bytes = await doc.save({ useObjectStreams: true });
      const blob = new Blob([uint8ToArrayBuffer(bytes)], { type: 'application/pdf' });
      setResult({
        name: `${baseName(singlePdf.name)}_optimized.pdf`,
        blob,
        originalSize: singlePdf.size,
        newSize: blob.size,
        note: '保留文字與向量內容；主要移除部分中繼資料並重新封裝 PDF。'
      });
      setMessage('PDF 安全優化完成。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PDF 優化失敗。若 PDF 有加密或格式特殊，可能無法處理。');
    } finally {
      setBusy(false);
    }
  }

  async function compressPdfAsImages() {
    if (!singlePdf) return setMessage('請先選擇 PDF。');
    setBusy(true);
    setMessage('正在將 PDF 頁面圖片化壓縮。此模式可能讓文字無法選取，適合上傳限制或圖片型報告。');
    try {
      const pdfjsLib = await import('pdfjs-dist');
      const { jsPDF } = await import('jspdf');
      const workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
      (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerSrc;

      const pdf = await (pdfjsLib as any).getDocument({ data: await singlePdf.arrayBuffer() }).promise;
      let outputDoc: InstanceType<typeof jsPDF> | null = null;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: visualSettings.scale });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('瀏覽器不支援 Canvas。');
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', visualSettings.quality);
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

        if (!outputDoc) {
          outputDoc = new jsPDF({ orientation, unit: 'px', format: [canvas.width, canvas.height], compress: true });
        } else {
          outputDoc.addPage([canvas.width, canvas.height], orientation);
        }
        outputDoc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height, undefined, 'FAST');
      }

      if (!outputDoc) throw new Error('PDF 沒有可處理頁面。');
      const blob = outputDoc.output('blob');
      setResult({
        name: `${baseName(singlePdf.name)}_visual_${visualMode}.pdf`,
        blob,
        originalSize: singlePdf.size,
        newSize: blob.size,
        note: `圖片化壓縮：${visualSettings.label}。此模式會犧牲文字可選取性。`
      });
      setMessage('PDF 圖片化壓縮完成。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PDF 圖片化壓縮失敗。');
    } finally {
      setBusy(false);
    }
  }

  async function mergePdfs() {
    if (mergeFiles.length < 2) return setMessage('請至少選擇兩個 PDF。');
    setBusy(true);
    setMessage('正在合併 PDF。');
    try {
      const merged = await PDFDocument.create();
      let totalSize = 0;
      for (const file of mergeFiles) {
        totalSize += file.size;
        const source = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
        const copiedPages = await merged.copyPages(source, source.getPageIndices());
        copiedPages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save({ useObjectStreams: true });
      const blob = new Blob([uint8ToArrayBuffer(bytes)], { type: 'application/pdf' });
      setResult({
        name: 'localsnap_merged.pdf',
        blob,
        originalSize: totalSize,
        newSize: blob.size,
        note: `已合併 ${mergeFiles.length} 個 PDF。`
      });
      setMessage('PDF 合併完成。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PDF 合併失敗。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <div>
          <h2>PDF 壓縮與合併</h2>
          <p>針對 10MB 以下 PDF 設計。壓縮分成保留文字的安全優化，以及犧牲文字可選取性的圖片化高壓縮。</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>選擇單一 PDF：壓縮 / 優化</label>
          <input className="file-input" type="file" accept="application/pdf" onChange={(e) => setSinglePdf(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>圖片化壓縮品質</label>
          <select value={visualMode} onChange={(e) => setVisualMode(e.target.value as 'small' | 'balanced' | 'high')}>
            <option value="small">小檔優先</option>
            <option value="balanced">平衡</option>
            <option value="high">清晰優先</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>選擇多個 PDF：合併</label>
          <input className="file-input" type="file" accept="application/pdf" multiple onChange={(e) => setMergeFiles(Array.from(e.target.files || []))} />
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={optimizePdf} disabled={busy}>安全優化 PDF</button>
        <button className="secondary" onClick={compressPdfAsImages} disabled={busy}>圖片化高壓縮</button>
        <button className="ghost" onClick={mergePdfs} disabled={busy}>合併 PDF</button>
        <button className="ghost" onClick={() => result && downloadBlob(result.blob, result.name)} disabled={!result}>下載結果</button>
      </div>

      <div className="notice warn">PDF 壓縮效果會受原始檔影響。若原檔已壓縮過，安全優化可能只小幅下降；圖片化壓縮較有感，但會讓文字變成圖片。</div>
      {message && <div className={`notice ${message.includes('完成') ? 'ok' : ''}`}>{message}</div>}
      {result && <ResultList results={[result]} />}
    </section>
  );
}

function PptTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.72);
  const [maxEdge, setMaxEdge] = useState(1600);
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function compressPptx() {
    if (!file) return setMessage('請先選擇 PPTX 檔案。');
    if (!file.name.toLowerCase().endsWith('.pptx')) return setMessage('目前僅支援 .pptx，不支援舊版 .ppt。');
    setBusy(true);
    setMessage('正在讀取 PPTX 內的圖片。圖多的簡報會需要一些時間。');

    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const mediaEntries = Object.values(zip.files).filter((entry) => /ppt\/media\/.*\.(png|jpe?g|webp)$/i.test(entry.name));
      let replaced = 0;
      let skipped = 0;

      for (const entry of mediaEntries) {
        const originalBlob = await entry.async('blob');
        const image = await loadImage(originalBlob);
        const ext = entry.name.split('.').pop()?.toLowerCase() || 'jpg';
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const ratio = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = drawImageToCanvas(image, width, height, mime);
        const compressedBlob = await canvasToBlob(canvas, mime, quality);

        if (compressedBlob.size < originalBlob.size) {
          zip.file(entry.name, await compressedBlob.arrayBuffer());
          replaced += 1;
        } else {
          skipped += 1;
        }
      }

      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      setResult({
        name: `${baseName(file.name)}_compressed.pptx`,
        blob,
        originalSize: file.size,
        newSize: blob.size,
        note: `處理圖片 ${mediaEntries.length} 張；替換 ${replaced} 張，略過 ${skipped} 張。`
      });
      setMessage('PPTX 壓縮完成。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'PPTX 壓縮失敗。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <div>
          <h2>PPTX 圖片壓縮</h2>
          <p>適合處理圖片很多的簡報。工具會嘗試壓縮與縮小簡報內的圖片，並保留原始 PPTX 結構。</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>選擇 PPTX</label>
          <input className="file-input" type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>圖片品質：{Math.round(quality * 100)}</label>
          <input type="range" min="40" max="90" value={Math.round(quality * 100)} onChange={(e) => setQuality(Number(e.target.value) / 100)} />
        </div>
        <div className="field">
          <label>圖片最大邊長</label>
          <select value={maxEdge} onChange={(e) => setMaxEdge(Number(e.target.value))}>
            <option value={2200}>2200px，清晰優先</option>
            <option value={1600}>1600px，平衡</option>
            <option value={1200}>1200px，小檔優先</option>
            <option value={900}>900px，極小檔</option>
          </select>
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={compressPptx} disabled={busy}>壓縮 PPTX</button>
        <button className="secondary" onClick={() => result && downloadBlob(result.blob, result.name)} disabled={!result}>下載結果</button>
      </div>

      <div className="notice warn">目前支援 .pptx。若簡報主要大檔來源是影片、嵌入字型或特殊物件，壓縮幅度可能有限。壓縮後請打開檢查版面。</div>
      {message && <div className={`notice ${message.includes('完成') ? 'ok' : ''}`}>{message}</div>}
      {result && <ResultList results={[result]} />}
    </section>
  );
}

function BackgroundTool() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(42);
  const [sampleMode, setSampleMode] = useState<'corners' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'>('corners');
  const [result, setResult] = useState<ProcessedFile | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  function getSampleColor(data: Uint8ClampedArray, width: number, height: number) {
    const points: Record<string, [number, number]> = {
      topLeft: [0, 0],
      topRight: [width - 1, 0],
      bottomLeft: [0, height - 1],
      bottomRight: [width - 1, height - 1]
    };

    const keys = sampleMode === 'corners' ? Object.keys(points) : [sampleMode];
    const colors = keys.map((key) => {
      const [x, y] = points[key];
      const i = (y * width + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    });

    return colors.reduce((acc, color) => [acc[0] + color[0], acc[1] + color[1], acc[2] + color[2]], [0, 0, 0]).map((value) => value / colors.length);
  }

  async function removePlainBackground() {
    if (!file) return setMessage('請先選擇圖片。');
    setBusy(true);
    setMessage('正在處理純色背景。');
    try {
      const image = await loadImage(file);
      const canvas = drawImageToCanvas(image, image.naturalWidth, image.naturalHeight, 'image/png');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('瀏覽器不支援 Canvas。');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const [r, g, b] = getSampleColor(data, canvas.width, canvas.height);

      for (let i = 0; i < data.length; i += 4) {
        const distance = Math.sqrt(
          Math.pow(data[i] - r, 2) +
          Math.pow(data[i + 1] - g, 2) +
          Math.pow(data[i + 2] - b, 2)
        );
        if (distance <= threshold) {
          data[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      const blob = await canvasToBlob(canvas, 'image/png', 1);
      setResult({
        name: `${baseName(file.name)}_transparent.png`,
        blob,
        originalSize: file.size,
        newSize: blob.size,
        width: canvas.width,
        height: canvas.height,
        previewUrl: URL.createObjectURL(blob),
        note: '已輸出透明 PNG。此工具適合白底、單色底或接近純色背景。'
      });
      setMessage('純色去背完成。');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '去背處理失敗。');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <div>
          <h2>JPG / PNG 純色背景去背</h2>
          <p>不使用雲端 AI，改用本機 Canvas 依背景色取樣轉成透明 PNG。適合白底商品圖、icon、截圖素材。</p>
        </div>
      </div>

      <div className="form-grid">
        <div className="field" style={{ gridColumn: 'span 2' }}>
          <label>選擇圖片</label>
          <input className="file-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="field">
          <label>背景取樣位置</label>
          <select value={sampleMode} onChange={(e) => setSampleMode(e.target.value as 'corners' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight')}>
            <option value="corners">四角平均</option>
            <option value="topLeft">左上角</option>
            <option value="topRight">右上角</option>
            <option value="bottomLeft">左下角</option>
            <option value="bottomRight">右下角</option>
          </select>
        </div>
        <div className="field">
          <label>容差：{threshold}</label>
          <input type="range" min="5" max="120" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={removePlainBackground} disabled={busy}>轉透明 PNG</button>
        <button className="secondary" onClick={() => result && downloadBlob(result.blob, result.name)} disabled={!result}>下載結果</button>
      </div>
      <div className="notice warn">這不是 AI 去背。複雜背景、髮絲、陰影、透明物件效果有限；如果之後要 AI 去背，可再加本機模型版本。</div>
      {message && <div className={`notice ${message.includes('完成') ? 'ok' : ''}`}>{message}</div>}
      {result && <ResultList results={[result]} />}
    </section>
  );
}

function ResultList({ results }: { results: ProcessedFile[] }) {
  if (!results.length) return null;

  return (
    <div className="results">
      {results.map((item) => (
        <article className="result-card" key={item.name}>
          <div className="result-top">
            <div className="filename">{item.name}</div>
            <button className="ghost" onClick={() => downloadBlob(item.blob, item.name)}>下載</button>
          </div>
          {item.previewUrl && <img className="preview" src={item.previewUrl} alt={item.name} />}
          <div className="meta">
            <span className="pill">原始 {formatBytes(item.originalSize)}</span>
            <span className="pill">輸出 {formatBytes(item.newSize)}</span>
            <span className="pill">{compressionRatio(item.originalSize, item.newSize)}</span>
            {item.width && item.height && <span className="pill">{item.width}×{item.height}</span>}
          </div>
          {item.note && <div className="small">{item.note}</div>}
        </article>
      ))}
    </div>
  );
}
