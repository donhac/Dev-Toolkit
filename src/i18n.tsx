import { createContext, useContext } from "react";

export type Language = "zh-CN" | "en";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const I18nContext = createContext<I18nContextValue>({
  language: "zh-CN",
  setLanguage: () => undefined,
});

export function useI18n() {
  return useContext(I18nContext);
}

export const uiMessages = {
  "zh-CN": {
    dashboard: "工作台",
    searchPlaceholder: "搜索工具...（按 / 聚焦）",
    noToolsMatched: "没有匹配到相关工具",
    switchTo: "切换到",
    light: "浅色",
    dark: "深色",
    chinese: "中文",
    english: "EN",
    toolNotFound: "工具不存在",
    toolNotFoundDesc: "当前请求的工具尚未注册，请回到仪表盘选择可用工具。",
    noCategoryResults: "当前分类下没有匹配到工具。",
    backTo: "返回",
    workspaceTitle: "工作台",
    workspaceDesc: "从首页进入工具工作区，保持整体交互统一，并持续扩展更多常用开发者工具。",
    copySuccess: "已复制",
    copyFailed: "复制失败",
    languageLabel: "语言",
    themeLabelLight: "浅色",
    themeLabelDark: "深色",
  },
  en: {
    dashboard: "Workspace",
    searchPlaceholder: "Search tools... (Press / to focus)",
    noToolsMatched: "No tools matched",
    switchTo: "Switch to",
    light: "Light",
    dark: "Dark",
    chinese: "中文",
    english: "EN",
    toolNotFound: "Tool Not Found",
    toolNotFoundDesc: "The requested tool is not registered yet. Use the dashboard to pick an available workspace.",
    noCategoryResults: "No tools matched the current search in this category.",
    backTo: "Back to",
    workspaceTitle: "Workspace",
    workspaceDesc: "Start from the dashboard, jump into specific tool workspaces, and keep the overall interaction flow consistent as more utilities are integrated.",
    copySuccess: "Copied",
    copyFailed: "Copy failed",
    languageLabel: "Language",
    themeLabelLight: "Light",
    themeLabelDark: "Dark",
  },
} as const;
