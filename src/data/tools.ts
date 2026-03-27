import {
  Activity,
  ArrowLeftRight,
  Clock,
  Code,
  FileJson,
  Image as ImageIcon,
  LayoutGrid,
  Lock,
  Shield,
  ShieldCheck,
  Sparkles,
  Terminal,
  WandSparkles,
  Zap,
  Cpu,
  AlertTriangle,
  Dices,
  ScanSearch,
  ImageUpscale,
} from "lucide-react";
import type { AppRoute, ToolCategory, ToolDefinition, ToolStat } from "../types/tool";
import type { Language } from "../i18n";

export const categoryMeta: Record<
  ToolCategory,
  { label: string; icon: typeof Terminal; description: string }
> = {
  dashboard: {
    label: "Dashboard",
    icon: Terminal,
    description: "Overview of your most-used internal utilities and entry points.",
  },
  formatters: {
    label: "Formatters",
    icon: LayoutGrid,
    description: "Prettify, validate, and normalize structured data and text payloads.",
  },
  generators: {
    label: "Generators",
    icon: Sparkles,
    description: "Generate secure strings, cron presets, and other development helpers.",
  },
  converters: {
    label: "Converters",
    icon: ArrowLeftRight,
    description: "Translate content between machine formats and human-readable views.",
  },
  security: {
    label: "Security",
    icon: ShieldCheck,
    description: "Inspect encodings, tokens, and match logic in a safer workspace.",
  },
};

export const tools: ToolDefinition[] = [
  {
    slug: "base64-encoder-decoder",
    title: "Base64 Encoder/Decoder",
    shortDescription: "Swiftly encode and decode strings or binary data to Base64.",
    description:
      "A dual-pane workspace for text and Base64 transformations with URL-safe support and automatic mode detection.",
    category: "converters",
    variant: "primary",
    icon: Code,
    status: "System Live",
    featured: true,
    cardSize: "large",
    tags: ["base64", "encoding", "converter", "text"],
  },
  {
    slug: "timestamp-converter",
    title: "Timestamp Converter",
    shortDescription: "Unix timestamps to ISO 8601 and human-readable dates.",
    description:
      "Translate timestamps in both directions with UTC and local time visibility for debugging distributed systems.",
    category: "converters",
    variant: "secondary",
    icon: Clock,
    status: "Core Module",
    tags: ["time", "epoch", "date", "converter"],
  },
  {
    slug: "json-formatter",
    title: "JSON Formatter",
    shortDescription: "Prettify, minify, and validate JSON blocks instantly.",
    description:
      "A high-clarity JSON editor for formatting, minifying, and validating structured payloads with line-aware output.",
    category: "formatters",
    variant: "tertiary",
    icon: FileJson,
    tags: ["json", "formatter", "validator", "api"],
  },
  {
    slug: "regex-tester",
    title: "Regex Tester",
    shortDescription: "Write and debug complex patterns with live matches.",
    description:
      "Craft and inspect regular expressions with flag controls, inline errors, and grouped match output.",
    category: "security",
    variant: "primary",
    icon: Shield,
    tags: ["regex", "pattern", "tester", "match"],
  },
  {
    slug: "random-generator",
    title: "Random Generator",
    shortDescription: "Generate one or many secure random strings with configurable rules.",
    description:
      "Generate configurable high-entropy strings with character-set controls, batch counts, and quick history for repeated usage.",
    category: "generators",
    variant: "secondary",
    icon: Dices,
    tags: ["random", "password", "token", "generator"],
  },
  {
    slug: "image-to-base64",
    title: "Image Base64 Converter",
    shortDescription: "Convert image files to Base64 and restore images back from strings.",
    description:
      "Convert images to ready-to-use Base64 data URIs, inspect the preview, and rebuild downloadable image files from pasted strings.",
    category: "converters",
    variant: "tertiary",
    icon: ImageIcon,
    tags: ["image", "base64", "data-uri", "upload"],
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    shortDescription: "Compress screenshots and assets locally before sharing or shipping.",
    description:
      "Tune quality, width, and output format to reduce image size in-browser while keeping a side-by-side preview of the result.",
    category: "converters",
    variant: "secondary",
    icon: ImageUpscale,
    tags: ["image", "compress", "optimize", "preview"],
  },
  {
    slug: "cron-expression-generator",
    title: "Cron Expression Generator",
    shortDescription: "Build cron schedules visually and understand them at a glance.",
    description:
      "Configure recurring schedules with guided selectors, see the cron expression update live, and review the human-readable schedule summary.",
    category: "generators",
    variant: "primary",
    icon: ScanSearch,
    tags: ["cron", "schedule", "expression", "generator"],
  },
  {
    slug: "jwt-debugger",
    title: "JWT Debugger",
    shortDescription: "Decode and inspect JWT payloads securely.",
    description:
      "Reserved integration slot for token inspection and signature verification in the next backend iteration.",
    category: "security",
    variant: "primary",
    icon: Lock,
    status: "Planned",
    tags: ["jwt", "token", "security"],
  },
];

export const dashboardStats: ToolStat[] = [
  { label: "Connected APIs", value: "5", tone: "secondary" },
  { label: "Ready Tools", value: "8", tone: "primary" },
  { label: "Shared Modules", value: "12", tone: "tertiary" },
  { label: "Pending Slots", value: "1", tone: "error" },
];

export const dashboardMetrics = [
  { label: "API Latency", value: "12ms", icon: Activity, variant: "secondary" as const },
  { label: "Req/Sec", value: "1.2k", icon: Zap, variant: "primary" as const },
  { label: "Mem Usage", value: "42MB", icon: Cpu, variant: "tertiary" as const },
  { label: "Pending", value: "1", icon: AlertTriangle, variant: "error" as const },
];

export const quickLinks = [
  { label: "Dashboard", route: { kind: "dashboard" } as AppRoute },
  { label: "Formatters", route: { kind: "category", category: "formatters" } as AppRoute },
  { label: "Generators", route: { kind: "category", category: "generators" } as AppRoute },
  { label: "Converters", route: { kind: "category", category: "converters" } as AppRoute },
  { label: "Security", route: { kind: "category", category: "security" } as AppRoute },
];

const categoryTranslations = {
  "zh-CN": {
    dashboard: {
      label: "工作台",
      description: "概览常用开发者工具、快捷入口和当前可用模块。",
    },
    formatters: {
      label: "格式化",
      description: "整理、校验并规范结构化文本和数据内容。",
    },
    generators: {
      label: "生成器",
      description: "生成随机串、Cron 表达式以及常见开发辅助内容。",
    },
    converters: {
      label: "转换器",
      description: "在机器格式与人类可读视图之间快速转换内容。",
    },
    security: {
      label: "安全",
      description: "在更安全的工作区中检查编码、Token 和匹配逻辑。",
    },
  },
  en: {},
} as const;

const toolTranslations = {
  "zh-CN": {
    "base64-encoder-decoder": {
      title: "Base64 编码/解码",
      shortDescription: "快速完成文本或二进制数据与 Base64 的双向转换。",
      description: "提供双栏工作区，支持文本与 Base64 转换、URL-safe 模式以及自动识别编码方向。",
    },
    "timestamp-converter": {
      title: "时间戳转换",
      shortDescription: "在 Unix 时间戳、ISO 8601 和可读日期之间快速转换。",
      description: "支持双向转换，并同时查看 UTC、本地时间与 ISO 结果，方便排查分布式系统时间问题。",
    },
    "json-formatter": {
      title: "JSON 格式化",
      shortDescription: "即时格式化、压缩并校验 JSON 内容。",
      description: "高可读性的 JSON 编辑工作区，支持格式化、压缩、校验、树视图与行号显示。",
    },
    "regex-tester": {
      title: "正则测试",
      shortDescription: "实时编写、调试并查看复杂正则匹配结果。",
      description: "支持标志位控制、错误提示和分组匹配输出，帮助你快速验证正则表达式。",
    },
    "random-generator": {
      title: "随机生成器",
      shortDescription: "按规则生成一个或多个随机字符串。",
      description: "支持配置长度、字符集和批量数量，适合生成密码、Token 或测试数据。",
    },
    "image-to-base64": {
      title: "图片 Base64 转换",
      shortDescription: "图片文件与 Base64 字符串之间双向互转。",
      description: "将图片转换为可直接使用的 Base64 Data URI，也支持粘贴 Base64 内容还原图片并下载。",
    },
    "image-compressor": {
      title: "图片压缩",
      shortDescription: "在本地压缩截图和图片资源，减小体积后再分享或发布。",
      description: "支持调整质量、宽度和输出格式，在浏览器本地完成压缩并提供预览对比。",
    },
    "cron-expression-generator": {
      title: "Cron 表达式工具",
      shortDescription: "可视化生成并解析 Cron 调度表达式。",
      description: "通过配置项生成调度表达式，也支持反向解析已有 Cron，查看可读调度说明。",
    },
    "jwt-debugger": {
      title: "JWT 调试器",
      shortDescription: "安全地解码并查看 JWT Payload。",
      description: "为下一阶段的 Token 检查与签名校验预留的工具位。",
    },
  },
  en: {},
} as const;

const statTranslations = {
  "zh-CN": {
    "Connected APIs": "已连接 API",
    "Ready Tools": "可用工具",
    "Shared Modules": "共享模块",
    "Pending Slots": "待补位",
    "API Latency": "接口延迟",
    "Req/Sec": "每秒请求",
    "Mem Usage": "内存占用",
    Pending: "待处理",
  },
  en: {},
} as const;

const quickLinkTranslations = {
  "zh-CN": {
    Dashboard: "工作台",
    Formatters: "格式化",
    Generators: "生成器",
    Converters: "转换器",
    Security: "安全",
  },
  en: {},
} as const;

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getLocalizedCategoryMeta(category: ToolCategory, language: Language) {
  const fallback = categoryMeta[category];
  const translation = categoryTranslations[language]?.[category];
  if (!translation) {
    return fallback;
  }

  return {
    ...fallback,
    label: translation.label,
    description: translation.description,
  };
}

export function getLocalizedTool(tool: ToolDefinition, language: Language): ToolDefinition {
  const translation = toolTranslations[language]?.[tool.slug];
  if (!translation) {
    return tool;
  }

  return {
    ...tool,
    title: translation.title,
    shortDescription: translation.shortDescription,
    description: translation.description,
  };
}

export function getLocalizedDashboardStats(language: Language) {
  return dashboardStats.map((stat) => ({
    ...stat,
    label: statTranslations[language]?.[stat.label as keyof (typeof statTranslations)["zh-CN"]] ?? stat.label,
  }));
}

export function getLocalizedDashboardMetrics(language: Language) {
  return dashboardMetrics.map((metric) => ({
    ...metric,
    label: statTranslations[language]?.[metric.label as keyof (typeof statTranslations)["zh-CN"]] ?? metric.label,
  }));
}

export function getLocalizedQuickLinks(language: Language) {
  return quickLinks.map((link) => ({
    ...link,
    label: quickLinkTranslations[language]?.[link.label as keyof (typeof quickLinkTranslations)["zh-CN"]] ?? link.label,
  }));
}

export function getToolsByCategory(category: Exclude<ToolCategory, "dashboard">) {
  return tools.filter((tool) => tool.category === category);
}

export function matchesToolSearch(tool: ToolDefinition, query: string) {
  if (!query.trim()) {
    return true;
  }

  const zhTranslation = toolTranslations["zh-CN"]?.[tool.slug];

  const haystack = [
    tool.title,
    tool.shortDescription,
    tool.description,
    tool.category,
    zhTranslation?.title,
    zhTranslation?.shortDescription,
    zhTranslation?.description,
    ...tool.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.trim().toLowerCase());
}

export function getSearchResults(query: string) {
  return tools.filter((tool) => matchesToolSearch(tool, query)).slice(0, 6);
}
