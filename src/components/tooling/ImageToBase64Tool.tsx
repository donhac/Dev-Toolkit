import { useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, RefreshCw, Upload } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

function formatBytes(bytes: number) {
  if (!bytes) {
    return "--";
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function parseBase64Input(input: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("Paste a Base64 string or data URI first.");
  }

  const match = trimmed.match(/^data:(.*?);base64,(.*)$/);
  if (match) {
    return {
      mime: match[1] || "image/png",
      base64: match[2],
      dataUri: trimmed,
    };
  }

  return {
    mime: "image/png",
    base64: trimmed.replace(/\s+/g, ""),
    dataUri: `data:image/png;base64,${trimmed.replace(/\s+/g, "")}`,
  };
}

export default function ImageToBase64Tool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState("");
  const [base64Input, setBase64Input] = useState("");
  const [meta, setMeta] = useState({ name: "", size: "", mime: "" });
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          mediaUtility: "媒体工具",
          title: "图片 -> Base64",
          desc: "把图片资源转换为可嵌入的 Base64 字符串，也支持粘贴内容还原图片预览。",
          encode: "图片 -> Base64",
          decode: "Base64 -> 图片",
          dropTitle: "将图片拖到这里",
          dropDesc: "支持 PNG、JPG、WEBP、SVG，转换过程仅在浏览器本地进行。",
          selectFile: "选择文件",
          inputLabel: "Base64 或 Data URI",
          decodeAction: "解码",
          pasteHint: "粘贴 Base64 字符串或完整 data:image/...;base64,... 内容",
          preview: "预览缓冲区",
          previewHint: "上传图片或粘贴 Base64 后，这里会显示预览。",
          file: "文件",
          mime: "类型",
          output: "Data URI 输出",
          mode: "模式",
          status: "状态",
          previewReady: "预览已就绪",
          waiting: "等待输入",
          imagePayload: "图片内容",
          readFailed: "无法读取所选图片。",
          convertFailed: "图片转换失败。",
          decodeFailed: "Base64 解码失败。",
          restoredImage: "还原图片",
          imageOutput: "图片输出",
        }
      : {
          mediaUtility: "Media Utility",
          title: "Image -> Base64",
          desc: "Convert visual assets into embeddable Base64 strings, or restore image previews back from pasted content without leaving the browser.",
          encode: "Image -> Base64",
          decode: "Base64 -> Image",
          dropTitle: "Drop your image here",
          dropDesc: "Supports PNG, JPG, WEBP, SVG. The conversion stays local and updates the preview instantly.",
          selectFile: "Select File",
          inputLabel: "Base64 Or Data URI",
          decodeAction: "Decode",
          pasteHint: "Paste a Base64 string or full data:image/...;base64,... here",
          preview: "Preview Buffer",
          previewHint: "Upload an image or paste Base64 to preview it here.",
          file: "File",
          mime: "Mime",
          output: "Data URI Output",
          mode: "Mode",
          status: "Status",
          previewReady: "Preview Ready",
          waiting: "Waiting For Input",
          imagePayload: "Image payload",
          readFailed: "Unable to read the selected image.",
          convertFailed: "Image conversion failed.",
          decodeFailed: "Base64 decode failed.",
          restoredImage: "restored-image",
          imageOutput: "image-output",
        };

  async function handleFile(file: File) {
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        setMode("encode");
        setPreview(result);
        setOutput(result);
        setBase64Input(result);
        setMeta({
          name: file.name,
          size: formatBytes(file.size),
          mime: file.type || "image/*",
        });
      };
      reader.onerror = () => setError(text.readFailed);
      reader.readAsDataURL(file);
    } catch {
      setError(text.convertFailed);
    }
  }

  function decodeBase64() {
    setError("");

    try {
      const parsed = parseBase64Input(base64Input);
      setMode("decode");
      setPreview(parsed.dataUri);
      setOutput(parsed.dataUri);
      setMeta({
        name: text.restoredImage,
        size: `${Math.round((parsed.base64.length * 3) / 4 / 1024)} KB`,
        mime: parsed.mime,
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.decodeFailed);
    }
  }

  function downloadImage() {
    if (!preview) {
      return;
    }

    const anchor = document.createElement("a");
    anchor.href = preview;
    anchor.download = `${meta.name || text.imageOutput}.${
      meta.mime.includes("png")
        ? "png"
        : meta.mime.includes("svg")
          ? "svg"
          : meta.mime.includes("webp")
            ? "webp"
            : "jpg"
    }`;
    anchor.click();
  }

  function reset() {
    setMode("encode");
    setPreview("");
    setOutput("");
    setBase64Input("");
    setMeta({ name: "", size: "", mime: "" });
    setError("");
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <section className="xl:col-span-7 space-y-6">
        <section className="tool-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="tool-label text-secondary">{text.mediaUtility}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight text-on-surface">
                {text.title}
              </h2>
              <p className="text-on-surface-variant mt-3 max-w-2xl">{text.desc}</p>
            </div>

            <div className="segmented-toggle w-fit">
              <button
                type="button"
                onClick={() => setMode("encode")}
                className={`segmented-option ${mode === "encode" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
              >
                {text.encode}
              </button>
              <button
                type="button"
                onClick={() => setMode("decode")}
                className={`segmented-option ${mode === "decode" ? "bg-primary text-on-primary" : "text-on-surface-variant"}`}
              >
                {text.decode}
              </button>
            </div>
          </div>
        </section>

        {mode === "encode" ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="tool-hero-card w-full min-h-[420px] flex flex-col items-center justify-center text-center"
          >
            <div className="absolute -inset-1 opacity-25 blur-2xl bg-gradient-to-r from-secondary/15 to-primary/15" />
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6 mx-auto">
                <Upload className="text-secondary w-8 h-8" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">{text.dropTitle}</h3>
              <p className="text-on-surface-variant text-sm mb-6">{text.dropDesc}</p>
              <span className="secondary-button">{text.selectFile}</span>
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
            </div>
          </button>
        ) : (
          <section className="tool-panel">
            <div className="flex items-center justify-between mb-4">
              <label className="tool-label">{text.inputLabel}</label>
              <button type="button" onClick={decodeBase64} className="primary-button">
                {text.decodeAction}
              </button>
            </div>
            <textarea
              value={base64Input}
              onChange={(event) => setBase64Input(event.target.value)}
              className="tool-textarea min-h-[420px]"
              spellCheck={false}
              placeholder={text.pasteHint}
            />
          </section>
        )}

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </section>

      <aside className="xl:col-span-5 space-y-6">
        <section className="tool-panel overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-tertiary" />
              <span className="tool-label">{text.preview}</span>
            </div>
            {meta.size !== "--" && meta.size ? <span className="text-xs text-on-surface-variant">{meta.size}</span> : null}
          </div>
          <div className="aspect-video rounded-[1.75rem] bg-[radial-gradient(circle_at_center,rgba(186,158,255,0.1),transparent_55%)] border border-outline-variant/10 overflow-hidden flex items-center justify-center p-4">
            {preview ? (
              <img src={preview} alt={meta.name || "Preview"} className="max-h-full max-w-full object-contain rounded-xl shadow-2xl border border-outline-variant/10" />
            ) : (
              <p className="text-sm text-on-surface-variant">{text.previewHint}</p>
            )}
          </div>
          {meta.mime ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-surface-container-high px-4 py-3">
                <p className="tool-label">{text.file}</p>
                <p className="mt-2 text-sm text-on-surface break-all">{meta.name || text.restoredImage}</p>
              </div>
              <div className="rounded-2xl bg-surface-container-high px-4 py-3">
                <p className="tool-label">{text.mime}</p>
                <p className="mt-2 text-sm text-on-surface break-all">{meta.mime}</p>
              </div>
            </div>
          ) : null}
        </section>

        <section className="tool-panel">
          <div className="flex items-center justify-between mb-4">
            <span className="tool-label">{text.output}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void copy(output || base64Input, "image-base64-output", text.imagePayload)}
                className={`icon-button ${isCopied("image-base64-output") ? "copy-button-active" : ""}`}
              >
                <Copy className="w-4 h-4" />
              </button>
              <button type="button" onClick={downloadImage} className="icon-button">
                <Download className="w-4 h-4" />
              </button>
              <button type="button" onClick={reset} className="icon-button">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={mode === "encode" ? output : base64Input}
            onChange={(event) => setBase64Input(event.target.value)}
            readOnly={mode === "encode"}
            className={`tool-textarea min-h-[260px] ${isCopied("image-base64-output") ? "copied-item" : ""}`}
            placeholder="Base64 data URI will appear here..."
          />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-surface-container-high px-4 py-4">
              <p className="tool-label">{text.mode}</p>
              <p className="mt-2 text-sm text-on-surface">{mode === "encode" ? text.encode : text.decode}</p>
            </div>
            <div className="rounded-2xl bg-surface-container-high px-4 py-4">
              <p className="tool-label">{text.status}</p>
              <p className="mt-2 text-sm text-on-surface">{preview ? text.previewReady : text.waiting}</p>
            </div>
          </div>
        </section>
      </aside>
      <CopyToast toast={toast} />
    </div>
  );
}
