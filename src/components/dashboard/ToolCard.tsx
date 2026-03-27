import { motion } from "motion/react";
import { getLocalizedTool } from "../../data/tools";
import { useI18n } from "../../i18n";
import type { ToolDefinition } from "../../types/tool";

interface ToolCardProps {
  tool: ToolDefinition;
  onOpen: (slug: string) => void;
}

export default function ToolCard({ tool, onOpen }: ToolCardProps) {
  const { language } = useI18n();
  const localizedTool = getLocalizedTool(tool, language);
  const Icon = tool.icon;
  const glowClass = {
    primary: "neon-glow-primary",
    secondary: "neon-glow-secondary",
    tertiary: "neon-glow-tertiary",
  }[tool.variant];

  const iconBg = {
    primary: "bg-primary/12 text-primary",
    secondary: "bg-secondary/12 text-secondary",
    tertiary: "bg-tertiary/12 text-tertiary",
  }[tool.variant];

  const isLarge = tool.cardSize === "large";

  return (
    <motion.button
      type="button"
      whileHover={{ y: -4 }}
      onClick={() => onOpen(tool.slug)}
      className={`glass-card rounded-2xl p-6 group relative overflow-hidden text-left ${glowClass} ${
        isLarge ? "md:col-span-2 md:row-span-2 p-8" : ""
      }`}
    >
      {isLarge && (
        <div
          className={`absolute -top-12 -right-12 w-48 h-48 opacity-10 blur-[60px] rounded-full ${
            tool.variant === "primary"
              ? "bg-primary"
              : tool.variant === "secondary"
                ? "bg-secondary"
                : "bg-tertiary"
          }`}
        />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4 gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon className={isLarge ? "w-7 h-7" : "w-6 h-6"} />
          </div>
          {tool.status && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-tertiary/10 text-tertiary text-[10px] font-bold uppercase tracking-wider">
              <div className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse shadow-[0_0_5px_rgba(155,255,206,1)]" />
              {tool.status}
            </div>
          )}
        </div>

        <h3 className={`${isLarge ? "text-2xl" : "text-lg"} font-headline font-bold mb-2`}>
          {localizedTool.title}
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
          {localizedTool.shortDescription}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          {tool.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 rounded-full bg-surface-container-high text-[10px] uppercase tracking-[0.2em] text-on-surface-variant"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  );
}
