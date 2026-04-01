import ToolCard from "../components/dashboard/ToolCard";
import { getLocalizedCategoryMeta } from "../data/tools";
import { useI18n, uiMessages } from "../i18n";
import type { AppRoute, ToolDefinition, ToolCategory } from "../types/tool";

interface CategoryPageProps {
  category: Exclude<ToolCategory, "dashboard">;
  tools: ToolDefinition[];
  onNavigate: (route: AppRoute) => void;
}

export default function CategoryPage({ category, tools, onNavigate }: CategoryPageProps) {
  const { language } = useI18n();
  const meta = getLocalizedCategoryMeta(category, language);
  const Icon = meta.icon;

  return (
    <div className="max-w-[96rem] mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 text-secondary mb-3">
          <Icon className="w-5 h-5" />
          <span className="text-xs font-bold tracking-[0.25em] uppercase">{meta.label}</span>
        </div>
        <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-3">
          {meta.label}
        </h2>
        <p className="text-on-surface-variant max-w-2xl">{meta.description}</p>
      </div>

      {tools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} onOpen={(slug) => onNavigate({ kind: "tool", slug })} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-outline-variant/10 bg-surface-container p-10 text-on-surface-variant">
          {uiMessages[language].noCategoryResults}
        </div>
      )}
    </div>
  );
}
