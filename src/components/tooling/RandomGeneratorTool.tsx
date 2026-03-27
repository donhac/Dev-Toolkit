import { useState } from "react";
import { Copy, RefreshCw } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

function generateRandomValue(length: number, charset: string) {
  const values = new Uint32Array(length);
  window.crypto.getRandomValues(values);
  return Array.from(values, (value) => charset[value % charset.length]).join("");
}

export default function RandomGeneratorTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(1);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [value, setValue] = useState("u7K#m9P!xR2w@zL5");
  const [batch, setBatch] = useState<string[]>(["u7K#m9P!xR2w@zL5"]);
  const [history, setHistory] = useState<string[]>([]);
  const [error, setError] = useState("");

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
          historyHint: "生成后可在这里快速复制最近结果。",
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
          historyHint: "Generate values to build a quick copy history.",
          randomValue: "Random value",
          historyValue: "History value",
        };

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
    setValue(nextBatch[0] ?? "");
    setBatch(nextBatch);
    setHistory((current) => [...nextBatch, ...current].slice(0, 8));
  }

  return (
    <div className="grid grid-cols-12 gap-6 items-start">
      <div className="col-span-12 lg:col-span-8 tool-panel">
        <div className="flex justify-between items-center mb-6">
          <h3 className="tool-label">{text.generatedResult}</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void copy(value, "random-primary", text.randomValue)}
              className={`icon-button ${isCopied("random-primary") ? "copy-button-active" : ""}`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="bg-surface-container-high rounded-2xl p-10 min-h-[180px] flex items-center justify-center">
          <p className="text-4xl md:text-5xl font-mono text-on-surface break-all text-center tracking-tight leading-normal">
            {value}
          </p>
        </div>
        {batch.length > 1 ? (
          <div className="mt-5 grid gap-3">
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
        ) : null}
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
          <h3 className="tool-label mb-4">{text.recentResults}</h3>
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
