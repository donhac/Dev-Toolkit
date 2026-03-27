import StatCard from "../components/dashboard/StatCard";
import ToolCard from "../components/dashboard/ToolCard";
import { getLocalizedDashboardMetrics, getLocalizedDashboardStats, tools } from "../data/tools";
import { useI18n, uiMessages } from "../i18n";
import type { AppRoute } from "../types/tool";

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

export default function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { language } = useI18n();
  const featuredTools = tools.filter((tool) => tool.featured);
  const secondaryTools = tools.filter((tool) => !tool.featured).slice(0, 7);
  const dashboardMetrics = getLocalizedDashboardMetrics(language);
  const dashboardStats = getLocalizedDashboardStats(language);

  return (
    <div className="max-w-7xl mx-auto">
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

        <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
          {dashboardMetrics.map((metric) => (
            <StatCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              icon={metric.icon}
              variant={metric.variant}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-10">
        {dashboardStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-outline-variant/10 bg-surface-container p-5"
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold">
              {stat.label}
            </p>
            <p className="text-3xl font-black font-headline mt-3 text-on-surface">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
