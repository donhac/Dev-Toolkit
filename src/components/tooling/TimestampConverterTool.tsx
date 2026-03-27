import { useEffect, useState } from "react";
import { ArrowLeftRight, Clock3, Copy, RefreshCw } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

type TimezoneMode = "local" | "utc";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function getLocalDateParts(date: Date) {
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  };
}

function getUtcDateParts(date: Date) {
  return {
    date: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
    time: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}`,
  };
}

function getInitialTimestampState() {
  const now = new Date();
  const seconds = Math.floor(now.getTime() / 1000);
  const localParts = getLocalDateParts(now);

  return {
    epochInput: String(seconds),
    humanDate: localParts.date,
    humanTime: localParts.time,
    epochResult: {
      iso: now.toISOString(),
      utc: now.toUTCString(),
      local: now.toLocaleString(),
    },
    humanResult: String(seconds),
  };
}

export default function TimestampConverterTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const initialState = getInitialTimestampState();
  const [epochInput, setEpochInput] = useState(initialState.epochInput);
  const [humanDate, setHumanDate] = useState(initialState.humanDate);
  const [humanTime, setHumanTime] = useState(initialState.humanTime);
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>("local");
  const [unit, setUnit] = useState<"seconds" | "milliseconds">("seconds");
  const [epochResult, setEpochResult] = useState(initialState.epochResult);
  const [humanResult, setHumanResult] = useState(initialState.humanResult);
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          invalidTimestamp: "无效时间戳",
          dateTimeRequired: "日期和时间不能为空。",
          invalidDate: "无效日期输入",
          unixEpoch: "Unix Epoch Time",
          loadedCurrent: "默认已加载当前时间戳。",
          resetNow: "重置为当前时间",
          seconds: "秒",
          milliseconds: "毫秒",
          translateToHuman: "转换为可读时间",
          iso: "ISO",
          utc: "UTC",
          local: "本地时间",
          humanDate: "Human Readable Date",
          splitHint: "日期和时间已拆分显示，和设计稿一致。",
          localTimezone: "本地",
          date: "日期",
          time24: "时间 (24h)",
          outputFormat: "输出说明",
          outputDesc: "时区选择会影响日期与时间字段在回转为 epoch 时的解释方式。",
          translateToEpoch: "转换为时间戳",
          epochResult: "时间戳结果",
          awaiting: "等待转换...",
          digits: "位",
          copyEpochResult: "时间戳结果",
        }
      : {
          invalidTimestamp: "Invalid timestamp value",
          dateTimeRequired: "Date and time are required.",
          invalidDate: "Invalid date input",
          unixEpoch: "Unix Epoch Time",
          loadedCurrent: "Current timestamp is loaded by default.",
          resetNow: "Reset to current time",
          seconds: "Seconds",
          milliseconds: "Milliseconds",
          translateToHuman: "Translate To Human",
          iso: "ISO",
          utc: "UTC",
          local: "Local",
          humanDate: "Human Readable Date",
          splitHint: "Date and time are split into separate inputs to match the design.",
          localTimezone: "Local",
          date: "Date",
          time24: "Time (24h)",
          outputFormat: "Output Format",
          outputDesc: "The selected timezone controls how the date and time fields are interpreted before converting back to epoch.",
          translateToEpoch: "Translate To Epoch",
          epochResult: "Epoch Result",
          awaiting: "Awaiting conversion...",
          digits: "digits",
          copyEpochResult: "Epoch result",
        };

  function syncHumanParts(date: Date, nextTimezoneMode: TimezoneMode) {
    const parts = nextTimezoneMode === "utc" ? getUtcDateParts(date) : getLocalDateParts(date);
    setHumanDate(parts.date);
    setHumanTime(parts.time);
  }

  function convertEpochToHuman(nextValue = epochInput, nextUnit = unit, nextTimezoneMode = timezoneMode) {
    setError("");
    const numeric = Number(nextValue);
    const epochMs = nextUnit === "seconds" ? numeric * 1000 : numeric;
    const date = new Date(epochMs);

    if (Number.isNaN(date.getTime())) {
      setError(text.invalidTimestamp);
      return;
    }

    setEpochResult({
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toLocaleString(),
    });
    syncHumanParts(date, nextTimezoneMode);
  }

  function convertHumanToEpoch(
    nextDate = humanDate,
    nextTime = humanTime,
    nextUnit = unit,
    nextTimezoneMode = timezoneMode,
  ) {
    setError("");

    if (!nextDate || !nextTime) {
      setError(text.dateTimeRequired);
      return;
    }

    const value = nextTimezoneMode === "utc" ? `${nextDate}T${nextTime}Z` : `${nextDate}T${nextTime}`;
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      setError(text.invalidDate);
      return;
    }

    const epoch = nextUnit === "seconds" ? Math.floor(date.getTime() / 1000) : date.getTime();
    setHumanResult(String(epoch));
  }

  useEffect(() => {
    convertEpochToHuman(epochInput, unit, timezoneMode);
    convertHumanToEpoch(humanDate, humanTime, unit, timezoneMode);
  }, [unit, timezoneMode]);

  function resetToNow() {
    const nextState = getInitialTimestampState();
    setEpochInput(nextState.epochInput);
    setHumanDate(nextState.humanDate);
    setHumanTime(nextState.humanTime);
    setTimezoneMode("local");
    setUnit("seconds");
    setEpochResult(nextState.epochResult);
    setHumanResult(nextState.humanResult);
    setError("");
  }

  const currentEpochDigits = epochInput.length;
  const localTimezoneLabel = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <section className="tool-panel border-l-4 border-l-secondary relative overflow-hidden">
        <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div>
              <label className="tool-label">{text.unixEpoch}</label>
              <p className="text-xs text-on-surface-variant mt-2">{text.loadedCurrent}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase text-secondary">
                {currentEpochDigits} {text.digits}
              </div>
              <button type="button" onClick={resetToNow} className="icon-button" aria-label={text.resetNow}>
                <RefreshCw className="w-4 h-4 text-secondary" />
              </button>
            </div>
          </div>

          <input
            value={epochInput}
            onChange={(event) => setEpochInput(event.target.value)}
            className="tool-input h-20 text-3xl font-mono text-secondary"
            placeholder="1715849200"
          />

          <div className="mt-5 flex items-center gap-4">
            <label className="tool-radio">
              <input type="radio" checked={unit === "seconds"} onChange={() => setUnit("seconds")} />
              <span>{text.seconds}</span>
            </label>
            <label className="tool-radio">
              <input type="radio" checked={unit === "milliseconds"} onChange={() => setUnit("milliseconds")} />
              <span>{text.milliseconds}</span>
            </label>
          </div>

          <button type="button" onClick={() => convertEpochToHuman()} className="secondary-button mt-6 w-full justify-center">
            <ArrowLeftRight className="w-4 h-4" />
            {text.translateToHuman}
          </button>

          <div className="mt-6 grid gap-3">
            {[
              { label: text.iso, value: epochResult.iso, key: "timestamp-iso", tone: "text-secondary" },
              { label: text.utc, value: epochResult.utc, key: "timestamp-utc", tone: "text-on-surface" },
              { label: text.local, value: epochResult.local, key: "timestamp-local", tone: "text-on-surface" },
            ].map((item) => (
              <div key={item.key} className="rounded-2xl bg-surface-container-high p-4 border border-outline-variant/10">
                <div className="flex items-center justify-between gap-3">
                  <p className="tool-label">{item.label}</p>
                  <button
                    type="button"
                    onClick={() => void copy(item.value, item.key, item.label)}
                    className={`icon-button ${isCopied(item.key) ? "copy-button-active" : ""}`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className={`font-mono text-sm mt-3 break-all ${item.tone}`}>{item.value || text.awaiting}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="tool-panel border-l-4 border-l-primary relative overflow-hidden">
        <div className="absolute -top-6 -right-6 h-28 w-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <label className="tool-label">{text.humanDate}</label>
              <p className="text-xs text-on-surface-variant mt-2">{text.splitHint}</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={timezoneMode} onChange={(event) => setTimezoneMode(event.target.value as TimezoneMode)} className="tool-select">
                <option value="local">{text.localTimezone} ({localTimezoneLabel})</option>
                <option value="utc">UTC (GMT+0)</option>
              </select>
              <Clock3 className="w-4 h-4 text-primary" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 px-6 py-5">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{text.date}</span>
              <input
                value={humanDate}
                onChange={(event) => setHumanDate(event.target.value)}
                className="mt-2 w-full bg-transparent border-none p-0 text-xl font-mono text-primary focus:outline-none"
                type="text"
                placeholder="2026-03-27"
              />
            </div>
            <div className="rounded-2xl bg-surface-container-lowest border border-outline-variant/10 px-6 py-5">
              <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">{text.time24}</span>
              <input
                value={humanTime}
                onChange={(event) => setHumanTime(event.target.value)}
                className="mt-2 w-full bg-transparent border-none p-0 text-xl font-mono text-primary focus:outline-none"
                type="text"
                placeholder="14:33:20"
              />
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-primary/8 border border-primary/12 px-4 py-4">
            <p className="tool-label text-primary">{text.outputFormat}</p>
            <p className="mt-2 text-sm text-on-surface-variant">{text.outputDesc}</p>
          </div>

          <button type="button" onClick={() => convertHumanToEpoch()} className="primary-button mt-6 w-full justify-center">
            <ArrowLeftRight className="w-4 h-4" />
            {text.translateToEpoch}
          </button>

          <div className="mt-6 rounded-[1.75rem] bg-surface-container-lowest border border-outline-variant/10 p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="tool-label">{text.epochResult}</p>
              <button
                type="button"
                onClick={() => void copy(humanResult, "timestamp-epoch-result", text.copyEpochResult)}
                className={`icon-button ${isCopied("timestamp-epoch-result") ? "copy-button-active" : ""}`}
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="font-mono text-3xl text-primary mt-4 break-all">{humanResult || text.awaiting}</p>
          </div>

          {error ? <p className="mt-4 text-sm text-error">{error}</p> : null}
        </div>
      </section>
      <CopyToast toast={toast} />
    </div>
  );
}
