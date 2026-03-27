import { AlertCircle, CheckCircle2 } from "lucide-react";

interface CopyToastProps {
  toast:
    | {
        message: string;
        tone: "success" | "error";
      }
    | null;
}

export default function CopyToast({ toast }: CopyToastProps) {
  if (!toast) {
    return null;
  }

  const Icon = toast.tone === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div className="fixed left-1/2 top-24 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={`copy-toast ${toast.tone === "success" ? "copy-toast-success" : "copy-toast-error"}`}
      >
        <Icon className="w-5 h-5 shrink-0" />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
