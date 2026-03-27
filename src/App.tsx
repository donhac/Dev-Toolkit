import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import AppShell from "./components/layout/AppShell";
import { getSearchResults, getToolBySlug, getToolsByCategory, matchesToolSearch } from "./data/tools";
import { useAppRouter } from "./hooks/useAppRouter";
import { I18nContext, type Language, uiMessages } from "./i18n";
import CategoryPage from "./pages/CategoryPage";
import DashboardPage from "./pages/DashboardPage";
import ToolPage from "./pages/ToolPage";

export default function App() {
  const { route, navigate } = useAppRouter();
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const savedTheme = window.localStorage.getItem("devtoolkit-theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const [language, setLanguage] = useState<Language>(() => {
    const savedLanguage = window.localStorage.getItem("devtoolkit-language");
    return savedLanguage === "en" ? "en" : "zh-CN";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-dark", "theme-light");
    root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
    window.localStorage.setItem("devtoolkit-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("devtoolkit-language", language);
    document.documentElement.lang = language === "zh-CN" ? "zh-CN" : "en";
  }, [language]);

  let content: ReactNode = null;

  if (route.kind === "dashboard") {
    content = <DashboardPage onNavigate={navigate} />;
  }

  if (route.kind === "category") {
    const categoryTools = getToolsByCategory(route.category).filter((tool) =>
      matchesToolSearch(tool, query),
    );
    content = <CategoryPage category={route.category} tools={categoryTools} onNavigate={navigate} />;
  }

  if (route.kind === "tool") {
    const tool = getToolBySlug(route.slug);
    content = tool ? (
      <ToolPage tool={tool} onNavigate={navigate} />
    ) : (
      <div className="max-w-3xl mx-auto tool-panel">
        <h2 className="text-2xl font-headline font-bold mb-3">{uiMessages[language].toolNotFound}</h2>
        <p className="text-on-surface-variant">
          {uiMessages[language].toolNotFoundDesc}
        </p>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage }}>
      <AppShell
        route={route}
        query={query}
        results={getSearchResults(query)}
        onQueryChange={setQuery}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
      >
        {content}
      </AppShell>
    </I18nContext.Provider>
  );
}
