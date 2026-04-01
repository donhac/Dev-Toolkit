import { useState } from "react";
import { Copy, Lock, LockOpen } from "lucide-react";
import { api } from "../../services/api";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

export default function Base64Tool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [input, setInput] = useState("Hello, DevToolkit.");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [urlSafe, setUrlSafe] = useState(false);
  const [autoDetect, setAutoDetect] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          input: "输入",
          output: "输出",
          chars: "字符",
          copyInput: "复制输入",
          copyOutput: "复制输出",
          placeholderInput: "粘贴原始文本或 Base64 内容...",
          placeholderOutput: "转换结果会显示在这里...",
          autoDetect: "自动识别",
          urlSafe: "URL-safe",
          decode: "解码",
          encode: "编码",
          mode: "模式",
          processing: "处理中",
          inputLabel: "输入内容",
          outputLabel: "输出内容",
          conversionFailed: "转换失败",
        }
      : {
          input: "Input",
          output: "Output",
          chars: "chars",
          copyInput: "Copy input",
          copyOutput: "Copy output",
          placeholderInput: "Paste your source text or Base64 payload here...",
          placeholderOutput: "Your transformed output will appear here...",
          autoDetect: "Auto-detect",
          urlSafe: "URL-safe",
          decode: "Decode",
          encode: "Encode",
          mode: "Mode",
          processing: "processing",
          inputLabel: "Input",
          outputLabel: "Output",
          conversionFailed: "Conversion failed",
        };

  async function run(nextMode?: "encode" | "decode") {
    setLoading(true);
    setError("");

    try {
      const response = await api.transformBase64({
        input,
        mode: nextMode ?? mode,
        urlSafe,
      });

      if (response.detectedMode && autoDetect) {
        setMode(response.detectedMode);
      }

      setOutput(response.output);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.conversionFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
      <div className="tool-panel flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="tool-label">{text.input}</p>
            <span className="inline-flex items-center rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
              {input.length} {text.chars}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void copy(input, "base64-input", text.inputLabel)}
            className={`icon-button ${isCopied("base64-input") ? "copy-button-active" : ""}`}
            aria-label={text.copyInput}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className="tool-textarea min-h-[360px]"
          placeholder={text.placeholderInput}
          spellCheck={false}
        />
      </div>

      <div className="xl:w-[220px] flex xl:flex-col gap-4 justify-center py-4 xl:px-2">
        <div className="tool-panel rounded-[1.75rem] p-4 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-3">
            <label className="switch-row">
              <input
                type="checkbox"
                checked={autoDetect}
                onChange={(event) => setAutoDetect(event.target.checked)}
                className="sr-only"
              />
              <div className={`switch-track ${autoDetect ? "switch-track-active" : ""}`}>
                <div className="switch-thumb" />
              </div>
              <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface">
                {text.autoDetect}
              </span>
            </label>
            <label className="switch-row">
              <input
                type="checkbox"
                checked={urlSafe}
                onChange={(event) => setUrlSafe(event.target.checked)}
                className="sr-only"
              />
              <div className={`switch-track ${urlSafe ? "switch-track-active" : ""}`}>
                <div className="switch-thumb" />
              </div>
              <span className="text-xs font-medium text-on-surface-variant group-hover:text-on-surface">
                {text.urlSafe}
              </span>
            </label>
          </div>

          <div className="h-px bg-outline-variant/10" />

          <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
          <button
            type="button"
            onClick={() => {
              setMode("decode");
              void run("decode");
            }}
            className="control-action control-action-primary hover:scale-[1.03] active:scale-95"
          >
            <LockOpen className="w-5 h-5 mb-1" />
            {text.decode}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("encode");
              void run("encode");
            }}
            className="control-action control-action-secondary hover:bg-surface-bright active:scale-95"
          >
            <Lock className="w-5 h-5 mb-1 text-secondary" />
            {text.encode}
          </button>
          </div>
        </div>
      </div>

      <div className="tool-panel flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="tool-label">{text.output}</p>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {text.mode}: {mode}
            </span>
            {loading ? (
              <span className="inline-flex items-center rounded-full bg-tertiary/10 px-2 py-0.5 text-[10px] font-semibold text-tertiary">
                {text.processing}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void copy(output, "base64-output", text.outputLabel)}
            className={`icon-button ${isCopied("base64-output") ? "copy-button-active" : ""}`}
            aria-label={text.copyOutput}
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={error ? error : output}
          readOnly
          className={`tool-textarea min-h-[360px] ${error ? "text-error" : ""}`}
          placeholder={text.placeholderOutput}
          spellCheck={false}
        />
      </div>
      <CopyToast toast={toast} />
    </div>
  );
}
