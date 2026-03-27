import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import type { AppRoute, ToolDefinition } from "../../types/tool";

interface AppShellProps {
  route: AppRoute;
  query: string;
  results: ToolDefinition[];
  onQueryChange: (value: string) => void;
  onNavigate: (route: AppRoute) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
  children: ReactNode;
}

export default function AppShell({
  route,
  query,
  results,
  onQueryChange,
  onNavigate,
  theme,
  onToggleTheme,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen theme-shell">
      <Sidebar route={route} onNavigate={onNavigate} />
      <TopNav
        route={route}
        query={query}
        results={results}
        onQueryChange={onQueryChange}
        onNavigate={onNavigate}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <main className="lg:ml-72 pt-24 px-5 lg:px-8 pb-12 min-h-screen">{children}</main>
    </div>
  );
}
