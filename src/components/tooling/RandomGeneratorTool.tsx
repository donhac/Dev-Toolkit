import { useEffect, useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

const RANDOM_GENERATOR_CACHE_KEY = "dev-toolkit:random-generator";
const MAX_HISTORY_ITEMS = 12;

interface RandomGeneratorCache {
  length: number;
  count: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeDigits: boolean;
  includeSymbols: boolean;
  batch: string[];
  history: string[];
}

const defaultCache: RandomGeneratorCache = {
  length: 16,
  count: 1,
  includeUppercase: true,
  includeLowercase: true,
  includeDigits: true,
  includeSymbols: true,
  batch: [],
  history: [],
};

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const nextValue = Number(value);
  if (!Number.isFinite(nextValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(nextValue)));
}

function normalizeStringList(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string" && item.length > 0).slice(0, maxItems);
}

function readCachedState(): RandomGeneratorCache {
  if (typeof window === "undefined") {
    return defaultCache;
  }

  try {
    const cachedValue = window.localStorage.getItem(RANDOM_GENERATOR_CACHE_KEY);
    if (!cachedValue) {
      return defaultCache;
    }

    const parsed = JSON.parse(cachedValue) as Partial<RandomGeneratorCache>;

    return {
      length: clampNumber(parsed.length, 4, 128, defaultCache.length),
      count: clampNumber(parsed.count, 1, 50, defaultCache.count),
      includeUppercase: typeof parsed.includeUppercase === "boolean" ? parsed.includeUppercase : defaultCache.includeUppercase,
      includeLowercase: typeof parsed.includeLowercase === "boolean" ? parsed.includeLowercase : defaultCache.includeLowercase,
      includeDigits: typeof parsed.includeDigits === "boolean" ? parsed.includeDigits : defaultCache.includeDigits,
      includeSymbols: typeof parsed.includeSymbols === "boolean" ? parsed.includeSymbols : defaultCache.includeSymbols,
      batch: normalizeStringList(parsed.batch, 50),
      history: normalizeStringList(parsed.history, MAX_HISTORY_ITEMS),
    };
  } catch {
    return defaultCache;
  }
}

function generateRandomValue(length: number, charset: string) {
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => charset[value % charset.length]).join("");
}

export default function RandomGeneratorTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [cachedState] = useState(readCachedState);
  const [length, setLength] = useState(cachedState.length);
  const [count, setCount] = useState(cachedState.count);
  const [includeUppercase, setIncludeUppercase] = useState(cachedState.includeUppercase);
  const [includeLowercase, setIncludeLowercase] = useState(cachedState.includeLowercase);
  const [includeDigits, setIncludeDigits] = useState(cachedState.includeDigits);
  const [includeSymbols, setIncludeSymbols] = useState(cachedState.includeSymbols);
  const [batch, setBatch] = useState<string[]>(cachedState.batch);
  const [history, setHistory] = useState<string[]>(cachedState.history);
  const [error, setError] = useState("");
  const primaryValue = batch[0] ?? "";
  const hasMultipleResults = batch.length > 1;

  const text =
    language === "zh-CN"
      ? {
          selectCharset: "请至少选择一种字符集。",
          generatedResult: "生成结果",
          generateNew: "重新生成",
          parameters: "参数配置",
          length: "长度",
          count: "数量",
          countHint: "单次最多生成 50 条结果。",
          uppercase: "大写字母",
          lowercase: "小写字母",
          digits: "数字",
          symbols: "符号",
          recentResults: "最近结果",
          clearHistory: "清空最近结果",
          historyHint: "生成后可在这里快速复制最近结果。",
          emptyResult: "点击重新生成后，这里会显示随机值。",
          copyCurrent: "复制当前结果",
          batchResult: "本次结果",
          randomValue: "随机值",
          historyValue: "历史值",
        }
      : {
          selectCharset: "Select at least one character set.",
          generatedResult: "Generated Result",
          generateNew: "Generate New",
          parameters: "Parameters",
          length: "Length",
          count: "Count",
          countHint: "Generate up to 50 values in one batch.",
          uppercase: "Uppercase",
          lowercase: "Lowercase",
          digits: "Digits",
          symbols: "Symbols",
          recentResults: "Recent Results",
          clearHistory: "Clear recent results",
          historyHint: "Generate values to build a quick copy history.",
          emptyResult: "Generate a new value to show results here.",
          copyCurrent: "Copy current result",
          batchResult: "Batch results",
          randomValue: "Random value",
          historyValue: "History value",
        };

  useEffect(() => {
    const nextCache: RandomGeneratorCache = {
      length,
      count,
      includeUppercase,
      includeLowercase,
      includeDigits,
      includeSymbols,
      batch,
      history,
    };

    window.localStorage.setItem(RANDOM_GENERATOR_CACHE_KEY, JSON.stringify(nextCache));
  }, [batch, count, history, includeDigits, includeLowercase, includeSymbols, includeUppercase, length]);

  function generate() {
    setError("");
    const charset = [
      includeUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
      includeLowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
      includeDigits ? "0123456789" : "",
      includeSymbols ? "!@#$%^&*()-_=+[]{};:,.<>?" : "",
    ].join("");

    if (!charset) {
      setError(text.selectCharset);
      return;
    }

    const nextBatch = Array.from({ length: count }, () => generateRandomValue(length, charset));
    setBatch(nextBatch);
    setHistory((current) => [...nextBatch, ...current].slice(0, MAX_HISTORY_ITEMS));
  }

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-12 lg:col-span-8 tool-panel">
        <div className="flex justify-between items-center mb-6">
          <h3 className="tool-label">{text.generatedResult}</h3>
        </div>
        {hasMultipleResults ? (
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-2xl bg-surface-container-high px-4 py-3">
              <span className="tool-label">{text.batchResult}</span>
              <span className="font-mono text-sm font-bold text-primary">{batch.length}</span>
            </div>
            {batch.map((item, index) => (
              <button
                key={`${item}-${index}`}
                type="button"
                onClick={() => void copy(item, `random-batch-${index}`, `${text.randomValue} #${index + 1}`)}
                className={`w-full rounded-2xl bg-surface-container-low px-4 py-4 text-left font-mono text-sm text-on-surface hover:bg-surface-container-high transition-colors ${
                  isCopied(`random-batch-${index}`) ? "copied-item" : ""
                }`}
              >
                <span className="tool-label">#{index + 1}</span>
                <p className="mt-2 break-all">{item}</p>
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => (primaryValue ? void copy(primaryValue, "random-primary", text.copyCurrent) : undefined)}
            className={`w-full bg-surface-container-high rounded-2xl p-10 min-h-[180px] flex items-center justify-center transition-colors hover:bg-surface-container-highest ${
              isCopied("random-primary") ? "copied-item" : ""
            }`}
          >
            <p
              className={`text-4xl md:text-5xl font-mono break-all text-center tracking-tight leading-normal ${
                primaryValue ? "text-on-surface" : "text-on-surface-variant text-base md:text-lg"
              }`}
            >
              {primaryValue || text.emptyResult}
            </p>
          </button>
        )}
        <div className="mt-8 flex justify-center">
          <button type="button" onClick={generate} className="primary-button px-10 py-4 text-lg">
            {text.generateNew}
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
      </div>

      <aside className="col-span-12 lg:col-span-4 space-y-6">
        <section className="tool-panel">
          <h3 className="text-sm font-bold text-on-surface mb-6">{text.parameters}</h3>
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="tool-label">{text.length}</label>
              <span className="text-primary font-bold font-mono text-lg">{length}</span>
            </div>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="tool-range"
            />
          </div>

          <div className="mt-6">
            <label className="tool-label mb-3 block">{text.count}</label>
            <input
              type="number"
              min={1}
              max={50}
              value={count}
              onChange={(event) => setCount(Math.min(50, Math.max(1, Number(event.target.value) || 1)))}
              className="tool-input"
            />
            <p className="text-xs text-on-surface-variant mt-2">{text.countHint}</p>
          </div>

          <div className="mt-6 space-y-3">
            <label className="tool-toggle">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(event) => setIncludeUppercase(event.target.checked)}
              />
              <span>{text.uppercase}</span>
            </label>
            <label className="tool-toggle">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(event) => setIncludeLowercase(event.target.checked)}
              />
              <span>{text.lowercase}</span>
            </label>
            <label className="tool-toggle">
              <input
                type="checkbox"
                checked={includeDigits}
                onChange={(event) => setIncludeDigits(event.target.checked)}
              />
              <span>{text.digits}</span>
            </label>
            <label className="tool-toggle">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(event) => setIncludeSymbols(event.target.checked)}
              />
              <span>{text.symbols}</span>
            </label>
          </div>
        </section>

        <section className="tool-panel">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="tool-label">{text.recentResults}</h3>
            {history.length > 0 ? (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="icon-button"
                aria-label={text.clearHistory}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : null}
          </div>
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => void copy(item, `random-history-${index}`, text.historyValue)}
                  className={`w-full rounded-xl bg-surface-container-high px-4 py-3 text-left font-mono text-sm hover:bg-surface-container-highest transition-colors ${
                    isCopied(`random-history-${index}`) ? "copied-item" : ""
                  }`}
                >
                  {item}
                </button>
              ))
            ) : (
              <p className="text-sm text-on-surface-variant">{text.historyHint}</p>
            )}
          </div>
        </section>
      </aside>
      <CopyToast toast={toast} />
    </div>
  );
}
