import { useState } from "react";
import { ArrowDownUp, Braces, Copy, Eraser, Link, Lock, LockOpen } from "lucide-react";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";
import CopyToast from "../ui/CopyToast";

type Mode = "encode" | "decode";
type Scope = "component" | "url";

export default function UrlEncoderDecoderTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [scope, setScope] = useState<Scope>("component");
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          input: "输入",
          output: "输出",
          chars: "字符",
          component: "URL 组件",
          fullUrl: "完整 URL",
          scope: "编码范围",
          encode: "编码",
          decode: "解码",
          swap: "交换输入输出",
          clear: "清空",
          copyInput: "复制输入",
          copyOutput: "复制输出",
          inputLabel: "输入内容",
          outputLabel: "输出内容",
          inputPlaceholder: "例如：搜索词=开发者工具 & sort=最新",
          outputPlaceholder: "转换结果会显示在这里...",
          componentHint: "编码保留字符以外的内容，适合查询参数值或路径片段。",
          urlHint: "保留 : / ? # & = 等 URL 结构字符，适合处理完整地址。",
          encodeFailed: "编码失败：输入包含无法转换的 Unicode 字符。",
          decodeFailed: "解码失败：输入包含不完整或无效的百分号编码。",
          mode: "模式",
        }
      : {
          input: "Input",
          output: "Output",
          chars: "chars",
          component: "URL component",
          fullUrl: "Full URL",
          scope: "Encoding scope",
          encode: "Encode",
          decode: "Decode",
          swap: "Swap input and output",
          clear: "Clear",
          copyInput: "Copy input",
          copyOutput: "Copy output",
          inputLabel: "Input",
          outputLabel: "Output",
          inputPlaceholder: "e.g. query=developer tools & sort=newest",
          outputPlaceholder: "Your transformed output will appear here...",
          componentHint: "Encodes reserved characters; best for query values and path segments.",
          urlHint: "Preserves URL structure such as : / ? # & =; best for complete URLs.",
          encodeFailed: "Encode failed: the input contains an invalid Unicode character.",
          decodeFailed: "Decode failed: the input contains incomplete or invalid percent encoding.",
          mode: "Mode",
        };

  function transform(nextMode: Mode) {
    setMode(nextMode);
    setError("");

    try {
      const result =
        nextMode === "encode"
          ? scope === "component"
            ? encodeURIComponent(input)
            : encodeURI(input)
          : scope === "component"
            ? decodeURIComponent(input)
            : decodeURI(input);
      setOutput(result);
    } catch {
      setOutput("");
      setError(nextMode === "encode" ? text.encodeFailed : text.decodeFailed);
    }
  }

  function swap() {
    setInput(output);
    setOutput(input);
    setError("");
    setMode((current) => (current === "encode" ? "decode" : "encode"));
  }

  function clear() {
    setInput("");
    setOutput("");
    setError("");
  }

  return (
    <div className="space-y-5">
      <div className="tool-panel !p-4 md:!p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <p className="tool-label mb-2">{text.scope}</p>
          <p className="text-xs text-on-surface-variant">
            {scope === "component" ? text.componentHint : text.urlHint}
          </p>
        </div>
        <div className="segmented-toggle self-start lg:self-auto" aria-label={text.scope}>
          <button
            type="button"
            onClick={() => setScope("component")}
            className={`segmented-option inline-flex items-center gap-2 ${
              scope === "component" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
            aria-pressed={scope === "component"}
          >
            <Braces className="w-3.5 h-3.5" />
            {text.component}
          </button>
          <button
            type="button"
            onClick={() => setScope("url")}
            className={`segmented-option inline-flex items-center gap-2 ${
              scope === "url" ? "bg-primary text-on-primary" : "text-on-surface-variant"
            }`}
            aria-pressed={scope === "url"}
          >
            <Link className="w-3.5 h-3.5" />
            {text.fullUrl}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_1fr] gap-6 items-stretch">
        <div className="tool-panel flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <p className="tool-label">{text.input}</p>
              <span className="toolbar-pill toolbar-pill-secondary">
                {input.length} {text.chars}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={clear} className="icon-button" aria-label={text.clear}>
                <Eraser className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => void copy(input, "url-input", text.inputLabel)}
                className={`icon-button ${isCopied("url-input") ? "copy-button-active" : ""}`}
                aria-label={text.copyInput}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="tool-textarea min-h-[360px] placeholder:text-on-surface-variant/45"
            placeholder={text.inputPlaceholder}
            spellCheck={false}
          />
        </div>

        <div className="xl:w-[220px] flex xl:flex-col gap-4 justify-center py-4 xl:px-2">
          <div className="tool-panel rounded-[1.75rem] !p-4 flex flex-col gap-3 shadow-xl w-full">
            <div className="grid grid-cols-2 xl:grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => transform("encode")}
                className="control-action control-action-primary hover:scale-[1.03] active:scale-95"
              >
                <Lock className="w-5 h-5 mb-1" />
                {text.encode}
              </button>
              <button
                type="button"
                onClick={() => transform("decode")}
                className="control-action control-action-secondary hover:bg-surface-bright active:scale-95"
              >
                <LockOpen className="w-5 h-5 mb-1 text-secondary" />
                {text.decode}
              </button>
            </div>
            <button
              type="button"
              onClick={swap}
              disabled={!output}
              className="secondary-button !justify-center disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowDownUp className="w-4 h-4 xl:rotate-90" />
              {text.swap}
            </button>
          </div>
        </div>

        <div className="tool-panel flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="tool-label">{text.output}</p>
              <span className={`toolbar-pill ${mode === "encode" ? "toolbar-pill-primary" : "toolbar-pill-tertiary"}`}>
                {text.mode}: {mode === "encode" ? text.encode : text.decode}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void copy(output, "url-output", text.outputLabel)}
              className={`icon-button ${isCopied("url-output") ? "copy-button-active" : ""}`}
              aria-label={text.copyOutput}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={error || output}
            readOnly
            className={`tool-textarea min-h-[360px] ${error ? "text-error" : ""}`}
            placeholder={text.outputPlaceholder}
            spellCheck={false}
          />
        </div>
      </div>
      <CopyToast toast={toast} />
    </div>
  );
}
