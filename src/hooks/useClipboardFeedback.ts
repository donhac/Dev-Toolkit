import { useEffect, useRef, useState } from "react";
import { copyToClipboard } from "../services/api";
import { uiMessages } from "../i18n";

type ToastState =
  | {
      message: string;
      tone: "success" | "error";
    }
  | null;

export function useClipboardFeedback() {
  const [copiedKeys, setCopiedKeys] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<ToastState>(null);
  const copiedTimeouts = useRef<Map<string, number>>(new Map());
  const toastTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      copiedTimeouts.current.forEach((timeout) => window.clearTimeout(timeout));
      copiedTimeouts.current.clear();
      if (toastTimeout.current) {
        window.clearTimeout(toastTimeout.current);
      }
    };
  }, []);

  async function copy(value: string, key: string, label = "Content") {
    const language = window.localStorage.getItem("devtoolkit-language") === "en" ? "en" : "zh-CN";

    try {
      await copyToClipboard(value);
      setCopiedKeys((current) => ({ ...current, [key]: true }));
      setToast({
        message: language === "zh-CN" ? `${label}${uiMessages[language].copySuccess}` : `${label} ${uiMessages[language].copySuccess}`,
        tone: "success",
      });

      const existing = copiedTimeouts.current.get(key);
      if (existing) {
        window.clearTimeout(existing);
      }

      copiedTimeouts.current.set(
        key,
        window.setTimeout(() => {
          setCopiedKeys((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
          copiedTimeouts.current.delete(key);
        }, 1800),
      );
    } catch {
      setToast({
        message: language === "zh-CN" ? `${label}${uiMessages[language].copyFailed}` : `${label} ${uiMessages[language].copyFailed}`,
        tone: "error",
      });
    }

    if (toastTimeout.current) {
      window.clearTimeout(toastTimeout.current);
    }

    toastTimeout.current = window.setTimeout(() => {
      setToast(null);
    }, 1800);
  }

  function isCopied(key: string) {
    return Boolean(copiedKeys[key]);
  }

  return {
    copy,
    isCopied,
    toast,
  };
}
