import { useRef, useState } from "react";
import { Copy, Download, ImageUp, Upload } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 KB";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourcePreview, setSourcePreview] = useState("");
  const [compressedPreview, setCompressedPreview] = useState("");
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1600);
  const [format, setFormat] = useState("image/jpeg");
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          unableToRead: "无法读取所选图片。",
          unableToDecode: "无法解析该图片。",
          canvasUnavailable: "当前浏览器不支持画布压缩。",
          compressionFailed: "图片压缩失败。",
          dropTitle: "拖入图片开始压缩",
          dropDesc: "在本地调整格式、质量和最大宽度，减少文件体积。",
          chooseImage: "选择图片",
          quality: "质量",
          maxWidth: "最大宽度",
          outputFormat: "输出格式",
          preview: "预览",
          compressedPreviewAlt: "压缩预览",
          sourcePreviewAlt: "原图预览",
          previewPlaceholder: "压缩后的预览会显示在这里。",
          original: "原图",
          compressed: "压缩后",
          sizeReduction: "体积缩减",
          compress: "开始压缩",
          download: "下载结果",
          previewUrl: "预览地址",
          copiedPreviewUrl: "已复制预览地址",
          copyPreviewUrl: "复制预览地址",
        }
      : {
          unableToRead: "Unable to read the selected image.",
          unableToDecode: "Unable to decode the image.",
          canvasUnavailable: "Canvas compression is not available in this browser.",
          compressionFailed: "Image compression failed.",
          dropTitle: "Drop an image to compress",
          dropDesc: "Reduce file size locally with adjustable format, quality, and max width.",
          chooseImage: "Choose Image",
          quality: "Quality",
          maxWidth: "Max Width",
          outputFormat: "Output Format",
          preview: "Preview",
          compressedPreviewAlt: "Compressed preview",
          sourcePreviewAlt: "Source preview",
          previewPlaceholder: "Compressed output preview will appear here.",
          original: "Original",
          compressed: "Compressed",
          sizeReduction: "Size Reduction",
          compress: "Compress",
          download: "Download",
          previewUrl: "Preview URL",
          copiedPreviewUrl: "Copied Preview URL",
          copyPreviewUrl: "Copy Preview URL",
        };

  async function handleFile(file: File) {
    setError("");
    setSourceFile(file);
    setCompressedBlob(null);
    setCompressedPreview("");

    const reader = new FileReader();
    reader.onload = () => setSourcePreview(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => setError(text.unableToRead);
    reader.readAsDataURL(file);
  }

  async function compressImage() {
    if (!sourcePreview || !sourceFile) {
      return;
    }

    setError("");

    try {
      const image = new Image();
      image.src = sourcePreview;

      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(text.unableToDecode));
      });

      const ratio = image.width > maxWidth ? maxWidth / image.width : 1;
      const width = Math.max(1, Math.round(image.width * ratio));
      const height = Math.max(1, Math.round(image.height * ratio));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error(text.canvasUnavailable);
      }

      context.drawImage(image, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, format, quality);
      });

      if (!blob) {
        throw new Error(text.compressionFailed);
      }

      setCompressedBlob(blob);
      setCompressedPreview(URL.createObjectURL(blob));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.compressionFailed);
    }
  }

  function downloadResult() {
    if (!compressedBlob || !sourceFile) {
      return;
    }

    const extension = format === "image/webp" ? "webp" : format === "image/png" ? "png" : "jpg";
    const url = URL.createObjectURL(compressedBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sourceFile.name.replace(/\.[^.]+$/, "")}-compressed.${extension}`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const reduction =
    sourceFile && compressedBlob
      ? Math.max(0, Math.round((1 - compressedBlob.size / sourceFile.size) * 100))
      : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <section className="xl:col-span-7 space-y-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="tool-hero-card w-full min-h-[360px] flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/12 flex items-center justify-center mb-6">
            <Upload className="text-primary w-8 h-8" />
          </div>
          <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">{text.dropTitle}</h3>
          <p className="text-on-surface-variant text-sm mb-6">
            {text.dropDesc}
          </p>
          <span className="secondary-button">{text.chooseImage}</span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleFile(file);
              }
            }}
          />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="tool-panel">
            <div className="flex items-center justify-between mb-3">
              <label className="tool-label">{text.quality}</label>
              <span className="text-primary font-mono">{Math.round(quality * 100)}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={Math.round(quality * 100)}
              onChange={(event) => setQuality(Number(event.target.value) / 100)}
              className="tool-range"
            />
          </div>

          <div className="tool-panel">
            <label className="tool-label mb-3 block">{text.maxWidth}</label>
            <input
              type="number"
              value={maxWidth}
              min={320}
              max={4000}
              onChange={(event) => setMaxWidth(Number(event.target.value) || 1600)}
              className="tool-input"
            />
          </div>

          <div className="tool-panel">
            <label className="tool-label mb-3 block">{text.outputFormat}</label>
            <select value={format} onChange={(event) => setFormat(event.target.value)} className="tool-input">
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WEBP</option>
              <option value="image/png">PNG</option>
            </select>
          </div>
        </div>
      </section>

      <aside className="xl:col-span-5 space-y-6">
        <section className="tool-panel">
          <div className="flex items-center gap-3 mb-4">
            <ImageUp className="w-4 h-4 text-secondary" />
            <span className="tool-label">{text.preview}</span>
          </div>
          <div className="aspect-video rounded-[1.75rem] bg-surface-container-lowest border border-outline-variant/12 overflow-hidden flex items-center justify-center">
            {compressedPreview ? (
              <img src={compressedPreview} alt={text.compressedPreviewAlt} className="max-h-full max-w-full object-contain" />
            ) : sourcePreview ? (
              <img src={sourcePreview} alt={text.sourcePreviewAlt} className="max-h-full max-w-full object-contain" />
            ) : (
              <p className="text-sm text-on-surface-variant">{text.previewPlaceholder}</p>
            )}
          </div>
        </section>

        <section className="tool-panel">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="rounded-2xl bg-surface-container-high px-4 py-4">
              <p className="tool-label">{text.original}</p>
              <p className="mt-3 text-lg font-semibold text-on-surface">
                {sourceFile ? formatBytes(sourceFile.size) : "--"}
              </p>
            </div>
            <div className="rounded-2xl bg-surface-container-high px-4 py-4">
              <p className="tool-label">{text.compressed}</p>
              <p className="mt-3 text-lg font-semibold text-on-surface">
                {compressedBlob ? formatBytes(compressedBlob.size) : "--"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-primary/10 border border-primary/15 px-4 py-4 text-sm">
            <p className="tool-label text-primary">{text.sizeReduction}</p>
            <p className="mt-2 text-2xl font-headline font-bold text-on-surface">{reduction}%</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => void compressImage()} className="primary-button flex-1 justify-center">
              {text.compress}
            </button>
            <button type="button" onClick={downloadResult} className="secondary-button flex-1 justify-center">
              <Download className="w-4 h-4" />
              {text.download}
            </button>
            <button
              type="button"
              onClick={() => void copy(compressedPreview, "compressed-preview-url", text.previewUrl)}
              className="ghost-button w-full justify-center"
            >
              <Copy className="w-4 h-4" />
              {isCopied("compressed-preview-url") ? text.copiedPreviewUrl : text.copyPreviewUrl}
            </button>
          </div>

          {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
        </section>
        <CopyToast toast={toast} />
      </aside>
    </div>
  );
}
