import { useState } from "react";
import { Copy, RefreshCw, Sparkles, WandSparkles } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

const minuteOptions = [
  { label: "Every minute", value: "*" },
  { label: "Every 5 minutes", value: "*/5" },
  { label: "Every 15 minutes", value: "*/15" },
  { label: "Every 30 minutes", value: "*/30" },
  { label: "Specific minute", value: "custom" },
];

const hourOptions = [
  { label: "Every hour", value: "*" },
  { label: "Every 2 hours", value: "*/2" },
  { label: "Every 6 hours", value: "*/6" },
  { label: "Every 12 hours", value: "*/12" },
  { label: "Specific hour", value: "custom" },
];

const dayOfMonthOptions = [
  { label: "Every day", value: "*" },
  { label: "1st day of month", value: "1" },
  { label: "15th day of month", value: "15" },
  { label: "Last day of month", value: "L" },
];

const monthOptions = [
  { label: "Every month", value: "*" },
  { label: "Quarterly", value: "*/3" },
  { label: "Biannually", value: "*/6" },
  { label: "January", value: "1" },
  { label: "December", value: "12" },
];

const weekDays = [
  { label: "Mon", value: "1" },
  { label: "Tue", value: "2" },
  { label: "Wed", value: "3" },
  { label: "Thu", value: "4" },
  { label: "Fri", value: "5" },
  { label: "Sat", value: "6" },
  { label: "Sun", value: "0" },
];

function describeValue(value: string, unit: string) {
  if (value === "*") {
    return `every ${unit}`;
  }

  if (value.startsWith("*/")) {
    return `every ${value.slice(2)} ${unit}s`;
  }

  if (value === "L") {
    return "on the last day of the month";
  }

  return `${unit} ${value}`;
}

function resolveMode(value: string, options: Array<{ value: string }>) {
  return options.some((option) => option.value === value) ? value : "custom";
}

export default function CronExpressionTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [minuteMode, setMinuteMode] = useState("*/15");
  const [customMinute, setCustomMinute] = useState("0");
  const [hourMode, setHourMode] = useState("*");
  const [customHour, setCustomHour] = useState("9");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [selectedWeekDays, setSelectedWeekDays] = useState<string[]>(["1", "2", "3", "4", "5"]);
  const [cronInput, setCronInput] = useState("*/15 * * * 1,2,3,4,5");
  const [parseError, setParseError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          reverseParse: "反向解析",
          reverseDesc: "粘贴现有 cron 表达式，并把结果回填到可视化配置中。",
          parseExpression: "解析表达式",
          visualConfig: "可视化配置",
          visualDesc: "通过配置生成调度表达式，并保持和原始 cron 输出同步。",
          minutes: "分钟",
          hours: "小时",
          dayOfMonth: "每月日期",
          month: "月份",
          dayOfWeek: "星期",
          generatedExpression: "生成表达式",
          syntaxHint: "标准 5 段 cron 语法",
          humanSummary: "可读说明",
          syncIntoParser: "同步到解析框",
          resetDefaults: "恢复默认",
          cronExpression: "Cron 表达式",
          unsupported: "当前仅支持标准 5 段 cron 表达式。",
          unableToParse: "无法解析 cron 表达式。",
        }
      : {
          reverseParse: "Reverse Parse",
          reverseDesc: "Paste an existing cron expression and push its values back into the visual controls.",
          parseExpression: "Parse Expression",
          visualConfig: "Visual Configuration",
          visualDesc: "Build a schedule visually and keep the raw cron output in sync.",
          minutes: "Minutes",
          hours: "Hours",
          dayOfMonth: "Day Of Month",
          month: "Month",
          dayOfWeek: "Day Of Week",
          generatedExpression: "Generated Expression",
          syntaxHint: "Classic 5-field cron syntax",
          humanSummary: "Human Summary",
          syncIntoParser: "Sync Into Parser",
          resetDefaults: "Reset Defaults",
          cronExpression: "Cron expression",
          unsupported: "Only standard 5-field cron expressions are supported.",
          unableToParse: "Unable to parse cron expression.",
        };

  const minuteValue = minuteMode === "custom" ? customMinute || "0" : minuteMode;
  const hourValue = hourMode === "custom" ? customHour || "0" : hourMode;
  const weekValue = selectedWeekDays.length === 0 ? "*" : selectedWeekDays.join(",");
  const expression = `${minuteValue} ${hourValue} ${dayOfMonth} ${month} ${weekValue}`;

  const description = [
    describeValue(minuteValue, "minute"),
    describeValue(hourValue, "hour"),
    dayOfMonth === "*" ? "every day of the month" : describeValue(dayOfMonth, "day"),
    month === "*" ? "every month" : describeValue(month, "month"),
    weekValue === "*"
      ? "every day of the week"
      : `on ${selectedWeekDays
          .map((value) => weekDays.find((day) => day.value === value)?.label ?? value)
          .join(", ")}`,
  ].join(", ");

  function toggleWeekDay(value: string) {
    setSelectedWeekDays((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value].sort(),
    );
  }

  function syncCronInput() {
    setCronInput(expression);
    setParseError("");
  }

  function applyExpression(rawExpression: string) {
    const parts = rawExpression.trim().split(/\s+/);

    if (parts.length !== 5) {
      throw new Error(text.unsupported);
    }

    const [minutePart, hourPart, dayPart, monthPart, weekPart] = parts;
    setMinuteMode(resolveMode(minutePart, minuteOptions));
    setCustomMinute(resolveMode(minutePart, minuteOptions) === "custom" ? minutePart : customMinute);
    setHourMode(resolveMode(hourPart, hourOptions));
    setCustomHour(resolveMode(hourPart, hourOptions) === "custom" ? hourPart : customHour);
    setDayOfMonth(dayPart);
    setMonth(monthPart);
    setSelectedWeekDays(weekPart === "*" ? [] : weekPart.split(","));
    setCronInput(parts.join(" "));
  }

  function parseCronInput() {
    try {
      applyExpression(cronInput);
      setParseError("");
    } catch (error) {
      setParseError(error instanceof Error ? error.message : text.unableToParse);
    }
  }

  function reset() {
    setMinuteMode("*/15");
    setCustomMinute("0");
    setHourMode("*");
    setCustomHour("9");
    setDayOfMonth("*");
    setMonth("*");
    setSelectedWeekDays(["1", "2", "3", "4", "5"]);
    setCronInput("*/15 * * * 1,2,3,4,5");
    setParseError("");
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <section className="xl:col-span-8 space-y-6">
        <section className="tool-panel">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="tool-label">{text.reverseParse}</p>
              <p className="text-sm text-on-surface-variant mt-2">{text.reverseDesc}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <input
              value={cronInput}
              onChange={(event) => setCronInput(event.target.value)}
              className="tool-input font-mono text-lg"
              placeholder="*/15 * * * 1,2,3,4,5"
            />
            <button type="button" onClick={parseCronInput} className="primary-button justify-center">
              <WandSparkles className="w-4 h-4" />
              {text.parseExpression}
            </button>
          </div>
          {parseError ? <p className="mt-4 text-sm text-error">{parseError}</p> : null}
        </section>

        <section className="tool-panel">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="tool-label">{text.visualConfig}</p>
              <p className="text-sm text-on-surface-variant mt-2">{text.visualDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="tool-label mb-3 block">{text.minutes}</label>
              <select value={minuteMode} onChange={(event) => setMinuteMode(event.target.value)} className="tool-input">
                {minuteOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {minuteMode === "custom" ? (
                <input
                  value={customMinute}
                  onChange={(event) => setCustomMinute(event.target.value.replace(/[^\d,\-*/]/g, ""))}
                  className="tool-input mt-3"
                  placeholder="0"
                />
              ) : null}
            </div>

            <div>
              <label className="tool-label mb-3 block">{text.hours}</label>
              <select value={hourMode} onChange={(event) => setHourMode(event.target.value)} className="tool-input">
                {hourOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {hourMode === "custom" ? (
                <input
                  value={customHour}
                  onChange={(event) => setCustomHour(event.target.value.replace(/[^\d,\-*/]/g, ""))}
                  className="tool-input mt-3"
                  placeholder="9"
                />
              ) : null}
            </div>

            <div>
              <label className="tool-label mb-3 block">{text.dayOfMonth}</label>
              <select value={dayOfMonth} onChange={(event) => setDayOfMonth(event.target.value)} className="tool-input">
                {dayOfMonthOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="tool-label mb-3 block">{text.month}</label>
              <select value={month} onChange={(event) => setMonth(event.target.value)} className="tool-input">
                {monthOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8">
            <label className="tool-label mb-3 block">{text.dayOfWeek}</label>
            <div className="flex flex-wrap gap-3">
              {weekDays.map((day) => {
                const active = selectedWeekDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekDay(day.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
                        : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </section>

      <aside className="xl:col-span-4 space-y-6">
        <section className="tool-panel">
          <div className="flex items-center justify-between gap-3 mb-5">
            <div>
              <p className="tool-label">{text.generatedExpression}</p>
              <p className="text-sm text-on-surface-variant mt-2">{text.syntaxHint}</p>
            </div>
            <button
              type="button"
              onClick={() => void copy(expression, "cron-expression", text.cronExpression)}
              className={`icon-button ${isCopied("cron-expression") ? "copy-button-active" : ""}`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="rounded-[2rem] bg-surface-container-lowest border border-outline-variant/12 px-6 py-8 text-center">
            <p className="font-mono text-2xl md:text-3xl tracking-[0.22em] text-on-surface break-all">{expression}</p>
            <div className="mt-6 grid grid-cols-5 gap-2 text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
              <span>Min</span>
              <span>Hour</span>
              <span>Day</span>
              <span>Month</span>
              <span>Week</span>
            </div>
          </div>
        </section>

        <section className="tool-panel">
          <p className="tool-label">{text.humanSummary}</p>
          <p className="mt-4 text-sm leading-7 text-on-surface">{description}.</p>
          <div className="mt-6 flex flex-col gap-3">
            <button type="button" onClick={syncCronInput} className="secondary-button w-full justify-center">
              {text.syncIntoParser}
            </button>
            <button type="button" onClick={reset} className="ghost-button w-full justify-center">
              <RefreshCw className="w-4 h-4" />
              {text.resetDefaults}
            </button>
          </div>
        </section>
      </aside>
      <CopyToast toast={toast} />
    </div>
  );
}
