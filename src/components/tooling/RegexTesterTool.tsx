import { useEffect, useState } from "react";
import { Copy, SearchCode } from "lucide-react";
import { api } from "../../services/api";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

export default function RegexTesterTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [pattern, setPattern] = useState("([A-Z][a-z]+)\\s(\\d+)");
  const [flags, setFlags] = useState({
    g: true,
    i: true,
    m: false,
    y: false,
  });
  const [input, setInput] = useState(
    "January 2024 is a cold month. February 2024 is shorter.",
  );
  const [matches, setMatches] = useState<Array<{ value: string; index: number; groups: string[] }>>([]);
  const [error, setError] = useState("");

  const text =
    language === "zh-CN"
      ? {
          regex: "正则表达式",
          testString: "测试文本",
          copyText: "测试文本",
          matchResults: "匹配结果",
          regexFailed: "正则测试失败",
          index: "位置",
          group: "分组",
          empty: "输入正则和测试文本后，这里会实时显示匹配结果。",
        }
      : {
          regex: "Regular Expression",
          testString: "Test String",
          copyText: "Test string",
          matchResults: "Match Results",
          regexFailed: "Regex test failed",
          index: "index",
          group: "Group",
          empty: "Add a pattern and input text to inspect live matches.",
        };

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const activeFlags = Object.entries(flags)
        .filter(([, value]) => value)
        .map(([key]) => key)
        .join("");

      try {
        const response = await api.testRegex({ pattern, flags: activeFlags, input });
        setMatches(response.matches);
        setError(response.error ?? "");
      } catch (requestError) {
        setMatches([]);
        setError(requestError instanceof Error ? requestError.message : text.regexFailed);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [flags, input, pattern]);

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <section className="tool-panel">
          <label className="tool-label mb-4 block">{text.regex}</label>
          <div className="bg-surface-container-high rounded-2xl px-4 py-3 flex items-center gap-3 border border-outline-variant/10">
            <span className="font-mono text-xl text-on-surface-variant">/</span>
            <input
              value={pattern}
              onChange={(event) => setPattern(event.target.value)}
              className="flex-1 bg-transparent border-none outline-none font-mono text-lg text-on-surface"
              placeholder="Enter your regex pattern..."
            />
            <span className="font-mono text-xl text-on-surface-variant">/</span>
            <span className="font-mono text-primary text-lg min-w-10 text-right">
              {Object.entries(flags)
                .filter(([, value]) => value)
                .map(([key]) => key)
                .join("")}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(["g", "i", "m", "y"] as const).map((flag) => (
              <label key={flag} className="chip-toggle">
                <input
                  type="checkbox"
                  checked={flags[flag]}
                  onChange={(event) => setFlags((current) => ({ ...current, [flag]: event.target.checked }))}
                />
                <span>
                  {flag.toUpperCase()} <em>({flag})</em>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="tool-panel">
          <div className="flex items-center justify-between mb-4">
            <label className="tool-label">{text.testString}</label>
            <button
              type="button"
              onClick={() => void copy(input, "regex-input", text.copyText)}
              className={`icon-button ${isCopied("regex-input") ? "copy-button-active" : ""}`}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            className="tool-textarea min-h-[220px]"
            spellCheck={false}
          />
        </section>
      </div>

      <aside className="col-span-12 lg:col-span-4 tool-panel">
        <div className="flex items-center gap-2 mb-4">
          <SearchCode className="w-4 h-4 text-primary" />
          <span className="tool-label">{text.matchResults}</span>
        </div>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <div className="space-y-4">
          {matches.length > 0 ? (
            matches.map((match, index) => (
              <div key={`${match.index}-${index}`} className="rounded-2xl bg-surface-container-high p-4 border border-outline-variant/10">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    {text.index}: {match.index}
                  </span>
                </div>
                <p className="font-mono text-sm text-on-surface mb-3">{match.value}</p>
                <div className="space-y-2">
                  {match.groups.map((group, groupIndex) => (
                    <div key={`${match.index}-${groupIndex}`} className="text-xs">
                      <span className="text-on-surface-variant">{text.group} {groupIndex + 1}</span>
                      <p className="font-mono text-on-surface mt-1">{group}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">{text.empty}</p>
          )}
        </div>
      </aside>
      <CopyToast toast={toast} />
    </div>
  );
}
