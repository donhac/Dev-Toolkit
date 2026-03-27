import type { LucideIcon } from "lucide-react";

export type ToolVariant = "primary" | "secondary" | "tertiary";

export type ToolCategory =
  | "dashboard"
  | "formatters"
  | "generators"
  | "converters"
  | "security";

export interface ToolDefinition {
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  category: Exclude<ToolCategory, "dashboard">;
  variant: ToolVariant;
  icon: LucideIcon;
  status?: string;
  featured?: boolean;
  cardSize?: "large" | "regular";
  tags: string[];
}

export interface ToolStat {
  label: string;
  value: string;
  tone: "primary" | "secondary" | "tertiary" | "error";
}

export type AppRoute =
  | { kind: "dashboard" }
  | { kind: "category"; category: Exclude<ToolCategory, "dashboard"> }
  | { kind: "tool"; slug: string };
