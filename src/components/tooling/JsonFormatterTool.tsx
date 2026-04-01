import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Minimize2,
} from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type ViewMode = "code" | "tree";

function renderHighlightedJson(text: string): ReactNode[] {
  const tokenPattern =
    /("(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\]:,])/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let matchIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(<span key={`plain-${matchIndex}`}>{text.slice(cursor, match.index)}</span>);
    }

    const token = match[0];
    let className = "text-on-surface";

    if (token.startsWith('"') && /"\s*$/.test(token)) {
      className = tokenPattern.lastIndex < text.length && /^\s*:/.test(text.slice(tokenPattern.lastIndex))
        ? "text-secondary"
        : "text-tertiary";
    } else if (/^(true|false|null)$/.test(token) || /^-?\d/.test(token)) {
      className = "text-primary";
    } else if (/^[{}\[\]:,]$/.test(token)) {
      className = "text-on-surface-variant/70";
    }

    nodes.push(
      <span key={`token-${matchIndex}`} className={className}>
        {token}
      </span>,
    );

    cursor = tokenPattern.lastIndex;
    matchIndex += 1;
  }

  if (cursor < text.length) {
    nodes.push(<span key={`plain-tail`}>{text.slice(cursor)}</span>);
  }

  return nodes;
}

function JsonCodeSurface({
  value,
  showLineNumbers,
  placeholder,
  editable = false,
  onChange,
}: {
  value: string;
  showLineNumbers: boolean;
  placeholder: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}) {
  const overlayRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const displayText = value || "";
  const lineCount = Math.max(1, displayText.split("\n").length);

  function syncScroll() {
    if (!overlayRef.current || !textareaRef.current) {
      return;
    }

    overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
  }

  return (
    <div className="tool-output min-h-[640px] flex-1 p-0 overflow-hidden">
      <div className="flex h-full">
        {showLineNumbers ? (
          <div className="min-w-10 px-3 py-3 text-right text-on-surface-variant/35 select-none border-r border-outline-variant/10">
            {Array.from({ length: lineCount }, (_, index) => (
              <div key={`line-${index + 1}`} className="leading-7">
                {index + 1}
              </div>
            ))}
          </div>
        ) : null}

        <div className="relative flex-1 overflow-hidden">
          <pre
            ref={overlayRef}
            className={`absolute inset-0 m-0 overflow-auto px-4 py-3 text-sm leading-7 whitespace-pre-wrap break-words ${
              editable ? "pointer-events-none" : ""
            }`}
          >
            {displayText ? (
              renderHighlightedJson(displayText)
            ) : (
              <span className="text-on-surface-variant/45">{placeholder}</span>
            )}
          </pre>

          {editable ? (
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(event) => onChange?.(event.target.value)}
              onScroll={syncScroll}
              spellCheck={false}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent px-4 py-3 text-sm leading-7 text-transparent caret-on-surface outline-none"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function countNodes(value: JsonValue): number {
  if (value === null || typeof value !== "object") {
    return 1;
  }

  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countNodes(item), 1);
  }

  return Object.values(value).reduce<number>((sum, item) => sum + countNodes(item), 1);
}

function renderValuePreview(value: JsonValue) {
  if (value === null) {
    return "null";
  }

  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }

  if (typeof value === "object") {
    return `Object(${Object.keys(value).length})`;
  }

  return JSON.stringify(value);
}

function JsonTreeNode({
  label,
  rootLabel,
  value,
  path,
  collapsed,
  toggle,
}: {
  label?: string;
  rootLabel: string;
  value: JsonValue;
  path: string;
  collapsed: Set<string>;
  toggle: (path: string) => void;
}) {
  const expandable = value !== null && typeof value === "object";
  const isCollapsed = expandable && collapsed.has(path);

  if (!expandable) {
    return (
      <div className="pl-4 border-l border-outline-variant/10">
        <p className="font-mono text-sm leading-7 break-all">
          {label ? <span className="text-secondary">"{label}"</span> : null}
          {label ? <span className="text-on-surface-variant">: </span> : null}
          <span className={typeof value === "string" ? "text-tertiary" : "text-primary"}>
            {JSON.stringify(value)}
          </span>
        </p>
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value);

  return (
    <div className="pl-4 border-l border-outline-variant/10">
      <button
        type="button"
        onClick={() => toggle(path)}
        className="flex items-center gap-2 text-left py-1 text-sm font-mono text-on-surface hover:text-primary transition-colors"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {label ? <span className="text-secondary">"{label}"</span> : <span className="text-primary">{rootLabel}</span>}
        <span className="text-on-surface-variant">: {renderValuePreview(value)}</span>
      </button>

      {!isCollapsed ? (
        <div className="mt-1 space-y-1">
          {entries.map(([childKey, childValue]) => (
            <JsonTreeNode
              key={`${path}.${childKey}`}
              label={Array.isArray(value) ? `[${childKey}]` : childKey}
              rootLabel={rootLabel}
              value={childValue}
              path={`${path}.${childKey}`}
              collapsed={collapsed}
              toggle={toggle}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function JsonFormatterTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [input, setInput] = useState(
    '{\n  "service": "devtoolkit",\n  "active": true,\n  "count": 3,\n  "items": [{ "id": 1, "name": "alpha" }]\n}',
  );
  const [indent, setIndent] = useState(2);
  const [viewMode, setViewMode] = useState<ViewMode>("code");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [status, setStatus] = useState(language === "zh-CN" ? "就绪" : "Ready");
  const [error, setError] = useState("");
  const [formattedOutput, setFormattedOutput] = useState("");
  const [parsedJson, setParsedJson] = useState<JsonValue | null>(null);
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());

  const text =
    language === "zh-CN"
      ? {
          ready: "就绪",
          validJson: "有效 JSON",
          invalidJson: "无效 JSON",
          minifiedJson: "已压缩 JSON",
          escaped: "已转义",
          unescaped: "已取消转义",
          invalidEscape: "转义无效",
          rawInput: "原始输入",
          formattedOutput: "格式化输出",
          placeholder: '{"paste": "在这里粘贴 JSON"}',
          compress: "压缩",
          escape: "\\ 转义",
          unescape: "取消转义",
          code: "代码",
          tree: "树视图",
          hideLines: "隐藏行号",
          showLines: "显示行号",
          collapseAll: "全部收起",
          expandAll: "全部展开",
          parseHint: "先解析有效 JSON，再查看可折叠树视图。",
          outputPlaceholder: "格式化结果会显示在这里...",
          spaces2: "2 空格",
          spaces4: "4 空格",
          nodes: "节点",
          chars: "字符",
          copyOutput: "JSON 输出",
          root: "根节点",
          invalidJsonFallback: "无效 JSON",
        }
      : {
          ready: "Ready",
          validJson: "Valid JSON",
          invalidJson: "Invalid JSON",
          minifiedJson: "Minified JSON",
          escaped: "Escaped",
          unescaped: "Unescaped",
          invalidEscape: "Invalid Escape",
          rawInput: "Raw Input",
          formattedOutput: "Formatted Output",
          placeholder: '{"paste": "your JSON here"}',
          compress: "Compress",
          escape: "\\ Escape",
          unescape: "Unescape",
          code: "Code",
          tree: "Tree",
          hideLines: "Hide Lines",
          showLines: "Show Lines",
          collapseAll: "Collapse All",
          expandAll: "Expand All",
          parseHint: "Parse valid JSON to inspect a collapsible tree view.",
          outputPlaceholder: "Formatted JSON will appear here...",
          spaces2: "2 spaces",
          spaces4: "4 spaces",
          nodes: "nodes",
          chars: "chars",
          copyOutput: "JSON output",
          root: "root",
          invalidJsonFallback: "Invalid JSON",
        };

  function formatError(errorValue: unknown) {
    return errorValue instanceof Error ? errorValue.message : text.invalidJsonFallback;
  }

  function parseInput() {
    const parsed = JSON.parse(input) as JsonValue;
    setParsedJson(parsed);
    return parsed;
  }

  function handleFormat() {
    try {
      setError("");
      const parsed = parseInput();
      const next = JSON.stringify(parsed, null, indent);
      setFormattedOutput(next);
      setStatus(text.validJson);
    } catch (requestError) {
      setParsedJson(null);
      setError(formatError(requestError));
      setStatus(text.invalidJson);
    }
  }

  function handleMinify() {
    try {
      setError("");
      const parsed = parseInput();
      const next = JSON.stringify(parsed);
      setFormattedOutput(next);
      setStatus(text.minifiedJson);
    } catch (requestError) {
      setParsedJson(null);
      setError(formatError(requestError));
      setStatus(text.invalidJson);
    }
  }

  function handleEscape() {
    const escaped = JSON.stringify(input).slice(1, -1);
    setFormattedOutput(escaped);
    setStatus(text.escaped);
    setError("");
  }

  function handleUnescape() {
    try {
      const unescaped = JSON.parse(`"${input.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`) as string;
      setFormattedOutput(unescaped);
      setStatus(text.unescaped);
      setError("");
    } catch (requestError) {
      setError(formatError(requestError));
      setStatus(text.invalidEscape);
    }
  }

  function togglePath(path: string) {
    setCollapsedPaths((current) => {
      const next = new Set(current);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }

  function collapseAll() {
    if (!parsedJson || typeof parsedJson !== "object" || parsedJson === null) {
      return;
    }

    const next = new Set<string>();

    const walk = (value: JsonValue, path: string) => {
      if (value === null || typeof value !== "object") {
        return;
      }

      next.add(path);
      const entries = Array.isArray(value)
        ? value.map((item, index) => [String(index), item] as const)
        : Object.entries(value);

      entries.forEach(([key, item]) => walk(item, `${path}.${key}`));
    };

    walk(parsedJson, "root");
    next.delete("root");
    setCollapsedPaths(next);
  }

  function expandAll() {
    setCollapsedPaths(new Set());
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!input.trim()) {
        setFormattedOutput("");
        setParsedJson(null);
        setError("");
        setStatus(text.ready);
        return;
      }

      handleFormat();
    }, 160);

    return () => window.clearTimeout(timer);
  }, [input, indent, language]);

  const output = error ? error : formattedOutput || text.outputPlaceholder;
  const stats = parsedJson
    ? {
        nodes: countNodes(parsedJson),
        chars: formattedOutput.length,
      }
    : null;
  const toolbarButtonClass = "toolbar-pill";
  const primaryToolbarButtonClass = "toolbar-pill toolbar-pill-primary";
  const secondaryToolbarButtonClass = "toolbar-pill toolbar-pill-secondary";
  const activeSegmentClass = "toolbar-pill toolbar-pill-primary";
  const inactiveSegmentClass = "toolbar-pill";
  const toolbarRowClass = "flex flex-wrap items-center gap-2 min-h-8";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
      <section className="xl:col-span-6 tool-panel flex flex-col px-5 py-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center min-h-7">
            <label className="tool-label">{text.rawInput}</label>
          </div>

          <div className={toolbarRowClass}>
            <button type="button" onClick={handleMinify} className={secondaryToolbarButtonClass}>
              <Minimize2 className="w-3.5 h-3.5" />
              {text.compress}
            </button>
            <button type="button" onClick={handleEscape} className={toolbarButtonClass}>
              {text.escape}
            </button>
            <button type="button" onClick={handleUnescape} className={toolbarButtonClass}>
              {text.unescape}
            </button>
            <select
              value={indent}
              onChange={(event) => setIndent(Number(event.target.value))}
              className="toolbar-select"
            >
              <option value={2}>{text.spaces2}</option>
              <option value={4}>{text.spaces4}</option>
            </select>
          </div>
        </div>

        <JsonCodeSurface
          value={input}
          showLineNumbers={showLineNumbers}
          placeholder={text.placeholder}
          editable
          onChange={setInput}
        />
      </section>

      <section className="xl:col-span-6 tool-panel flex flex-col px-5 py-5 md:px-6 md:py-5">
        <div className="flex flex-col gap-3 mb-3">
          <div className="flex items-center justify-between min-h-7">
            <label className="tool-label">{text.formattedOutput}</label>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.18em] ${error ? "bg-error/12 text-error" : "bg-tertiary/12 text-tertiary"}`}>
                {status}
              </span>
              {stats ? (
                <span className="text-xs text-on-surface-variant">
                  {stats.nodes} {text.nodes} · {stats.chars} {text.chars}
                </span>
              ) : null}
            </div>
          </div>

          <div className={toolbarRowClass}>
            <div className="segmented-toggle">
              {([
                { key: "code", label: text.code },
                { key: "tree", label: text.tree },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setViewMode(item.key)}
                  className={viewMode === item.key ? activeSegmentClass : inactiveSegmentClass}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowLineNumbers((current) => !current)}
              className={toolbarButtonClass}
            >
              {showLineNumbers ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showLineNumbers ? text.hideLines : text.showLines}
            </button>

            <button
              type="button"
              onClick={() => void copy(formattedOutput || output, "json-output", text.copyOutput)}
              className={isCopied("json-output") ? `${primaryToolbarButtonClass} copy-button-active` : primaryToolbarButtonClass}
            >
              <Copy className="w-3.5 h-3.5" />
              {text.copyOutput}
            </button>

            {viewMode === "tree" ? (
              <>
                <button type="button" onClick={collapseAll} className={secondaryToolbarButtonClass}>
                  {text.collapseAll}
                </button>
                <button type="button" onClick={expandAll} className={toolbarButtonClass}>
                  {text.expandAll}
                </button>
              </>
            ) : null}
          </div>
        </div>

        {viewMode === "code" ? (
          <JsonCodeSurface
            value={output}
            showLineNumbers={showLineNumbers}
            placeholder={text.outputPlaceholder}
          />
        ) : (
          <div className="tool-output min-h-[640px] flex-1">
            {parsedJson ? (
              <JsonTreeNode
                value={parsedJson}
                path="root"
                rootLabel={text.root}
                collapsed={collapsedPaths}
                toggle={togglePath}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-center text-on-surface-variant">
                {text.parseHint}
              </div>
            )}
          </div>
        )}
      </section>
      <CopyToast toast={toast} />
    </div>
  );
}
