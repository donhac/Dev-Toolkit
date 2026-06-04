import type { ReactNode } from "react";
import type { AppRoute, ToolDefinition } from "../../types/tool";

interface ToolScaffoldProps {
  tool: ToolDefinition;
  children: ReactNode;
  onNavigate?: (route: AppRoute) => void;
}

export default function ToolScaffold({ tool: _tool, children }: ToolScaffoldProps) {
  return (
    <div className="max-w-[96rem] mx-auto">
      {children}
    </div>
  );
}
