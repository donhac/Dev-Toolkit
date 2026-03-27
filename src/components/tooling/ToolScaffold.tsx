import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { getLocalizedCategoryMeta, getLocalizedTool } from "../../data/tools";
import { useI18n, uiMessages } from "../../i18n";
import type { AppRoute, ToolDefinition } from "../../types/tool";

interface ToolScaffoldProps {
  tool: ToolDefinition;
  onNavigate: (route: AppRoute) => void;
  children: ReactNode;
}

export default function ToolScaffold({ tool, onNavigate, children }: ToolScaffoldProps) {
  const { language } = useI18n();
  const category = getLocalizedCategoryMeta(tool.category, language);
  const localizedTool = getLocalizedTool(tool, language);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => onNavigate({ kind: "category", category: tool.category })}
          className="inline-flex items-center gap-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {uiMessages[language].backTo} {category.label}
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-[10px] font-bold tracking-[0.2em] uppercase">
            {category.label}
          </span>
          {tool.status ? (
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-tertiary">
              {tool.status}
            </span>
          ) : null}
        </div>

        <div className="tool-panel">
          <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight text-on-surface">
            {localizedTool.title}
          </h1>
          <p className="text-on-surface-variant mt-3 max-w-2xl">{localizedTool.description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}
