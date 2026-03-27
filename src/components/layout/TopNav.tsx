import { useDeferredValue, useEffect, useRef } from "react";
import { Search, Moon, SunMedium, ArrowUpRight } from "lucide-react";
import { getLocalizedQuickLinks, getLocalizedTool } from "../../data/tools";
import { useI18n, uiMessages } from "../../i18n";
import type { AppRoute, ToolDefinition } from "../../types/tool";

interface TopNavProps {
  route: AppRoute;
  query: string;
  results: ToolDefinition[];
  onQueryChange: (value: string) => void;
  onNavigate: (route: AppRoute) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function TopNav({
  route,
  query,
  results,
  onQueryChange,
  onNavigate,
  theme,
  onToggleTheme,
}: TopNavProps) {
  const { language, setLanguage } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const deferredQuery = useDeferredValue(query);
  const quickLinks = getLocalizedQuickLinks(language);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 theme-pane backdrop-blur-2xl h-16 flex items-center justify-between px-5 lg:px-8 border-b">
      <div className="hidden md:flex items-center gap-6 font-headline tracking-tight">
        {quickLinks.map((link) => {
          const active =
            link.route.kind === "dashboard"
              ? route.kind === "dashboard"
              : link.route.kind === "category" &&
                route.kind === "category" &&
                route.category === link.route.category;

          return (
            <button
              key={link.label}
              type="button"
              onClick={() => onNavigate(link.route)}
              className={`text-sm font-medium transition-colors ${
                active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 flex-1 justify-end max-w-3xl">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="text-on-surface-variant w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={uiMessages[language].searchPlaceholder}
            className="w-full rounded-2xl py-2.5 pl-10 pr-14 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-1 focus:ring-secondary/50 focus:border-secondary/20 transition-all border"
            style={{
              background: "color-mix(in srgb, var(--color-surface-container-lowest) 82%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-outline-variant) 16%, transparent)",
            }}
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            <kbd className="px-2 py-0.5 rounded text-[10px] font-bold text-on-surface-variant border" style={{
              background: "color-mix(in srgb, var(--color-surface-container) 84%, transparent)",
              borderColor: "color-mix(in srgb, var(--color-outline-variant) 16%, transparent)",
            }}>
              /
            </kbd>
          </div>

          {deferredQuery.trim() && (
            <div className="absolute top-[calc(100%+0.75rem)] left-0 right-0 rounded-[1.5rem] border shadow-2xl overflow-hidden theme-pane">
              {results.length > 0 ? (
                <div className="p-2">
                  {results.map((tool) => {
                    const localizedTool = getLocalizedTool(tool, language);
                    return (
                    <button
                      key={tool.slug}
                      type="button"
                      onClick={() => {
                        onNavigate({ kind: "tool", slug: tool.slug });
                        onQueryChange("");
                      }}
                      className="w-full text-left px-3 py-3 rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-on-surface">{localizedTool.title}</p>
                          <p className="text-xs text-on-surface-variant mt-1">{localizedTool.shortDescription}</p>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-on-surface-variant" />
                      </div>
                    </button>
                  )})}
                </div>
              ) : (
                <div className="px-4 py-5 text-sm text-on-surface-variant">
                  {uiMessages[language].noToolsMatched} “{deferredQuery}”.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3 ml-4">
        <button
          type="button"
          onClick={() => setLanguage(language === "zh-CN" ? "en" : "zh-CN")}
          className="inline-flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-all text-sm border"
          style={{ borderColor: "color-mix(in srgb, var(--color-outline-variant) 12%, transparent)" }}
          aria-label={uiMessages[language].languageLabel}
        >
          <span className="font-medium">{language === "zh-CN" ? uiMessages[language].english : uiMessages[language].chinese}</span>
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex items-center gap-2 px-3 py-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-all text-sm border"
          style={{ borderColor: "color-mix(in srgb, var(--color-outline-variant) 12%, transparent)" }}
          aria-label={`${uiMessages[language].switchTo} ${theme === "dark" ? uiMessages[language].light : uiMessages[language].dark}`}
        >
          {theme === "dark" ? <SunMedium className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span className="font-medium">{theme === "dark" ? uiMessages[language].themeLabelLight : uiMessages[language].themeLabelDark}</span>
        </button>
      </div>
    </header>
  );
}
