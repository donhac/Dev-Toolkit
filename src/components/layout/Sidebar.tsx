import { motion } from "motion/react";
import { Terminal } from "lucide-react";
import { getLocalizedCategoryMeta, tools } from "../../data/tools";
import { useI18n, uiMessages } from "../../i18n";
import type { AppRoute, ToolCategory } from "../../types/tool";

interface SidebarProps {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const categoryOrder: ToolCategory[] = [
  "dashboard",
  "formatters",
  "generators",
  "converters",
  "security",
];

export default function Sidebar({ route, onNavigate }: SidebarProps) {
  const { language } = useI18n();
  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 flex-col py-5 z-40 border-r theme-pane">
      <div className="px-5 mb-8">
        <button
          type="button"
          onClick={() => onNavigate({ kind: "dashboard" })}
          className="flex items-center gap-3 text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center shadow-lg shadow-primary-dim/20">
            <Terminal className="text-on-primary w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-primary font-headline tracking-tight">DevToolkit</h1>
            <p className="text-[10px] text-on-surface-variant tracking-[0.3em] uppercase font-bold">
              toolkit platform
            </p>
          </div>
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {categoryOrder.map((category) => {
          const meta = getLocalizedCategoryMeta(category, language);
          const Icon = meta.icon;
          const active =
            route.kind === "dashboard"
              ? category === "dashboard"
              : route.kind === "category"
                ? route.category === category
                : route.kind === "tool"
                  ? category !== "dashboard" &&
                    tools.some((tool) => tool.slug === route.slug && tool.category === category)
                  : false;

          const count =
            category === "dashboard"
              ? tools.filter((tool) => tool.featured).length
              : tools.filter((tool) => tool.category === category).length;

          const nextRoute =
            category === "dashboard"
              ? ({ kind: "dashboard" } as AppRoute)
              : ({ kind: "category", category } as AppRoute);

          return (
            <motion.button
              key={category}
              whileHover={{ x: 4 }}
              type="button"
              onClick={() => onNavigate(nextRoute)}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl transition-all duration-200 text-sm ${
                active
                  ? "bg-primary/10 text-primary border border-primary/15"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span className="font-medium">
                  {category === "dashboard" ? uiMessages[language].dashboard : meta.label}
                </span>
              </span>
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider bg-surface-container-lowest/40">
                {count}
              </span>
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
