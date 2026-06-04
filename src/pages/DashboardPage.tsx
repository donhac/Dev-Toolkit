import ToolCard from "../components/dashboard/ToolCard";
import { tools } from "../data/tools";
import { useI18n, uiMessages } from "../i18n";
import type { AppRoute } from "../types/tool";

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { language } = useI18n();
  const featuredTools = tools.filter((tool) => tool.featured);
  const secondaryTools = tools.filter((tool) => !tool.featured);

  return (
    <div className="max-w-[96rem] mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-headline font-bold text-on-surface tracking-tight mb-2">
          {uiMessages[language].workspaceTitle}
        </h2>
        <p className="text-on-surface-variant max-w-2xl">
          {uiMessages[language].workspaceDesc}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {featuredTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} onOpen={(slug) => onNavigate({ kind: "tool", slug })} />
        ))}

        {secondaryTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} onOpen={(slug) => onNavigate({ kind: "tool", slug })} />
        ))}
      </div>
    </div>
  );
}
