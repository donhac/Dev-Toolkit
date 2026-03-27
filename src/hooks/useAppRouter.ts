import { startTransition, useEffect, useState } from "react";
import type { AppRoute, ToolCategory } from "../types/tool";

function parsePathname(pathname: string): AppRoute {
  if (pathname === "/" || pathname === "") {
    return { kind: "dashboard" };
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] === "category" && segments[1]) {
    return {
      kind: "category",
      category: segments[1] as Exclude<ToolCategory, "dashboard">,
    };
  }

  if (segments[0] === "tools" && segments[1]) {
    return { kind: "tool", slug: segments[1] };
  }

  return { kind: "dashboard" };
}

export function routeToPath(route: AppRoute) {
  if (route.kind === "dashboard") {
    return "/";
  }

  if (route.kind === "category") {
    return `/category/${route.category}`;
  }

  return `/tools/${route.slug}`;
}

export function useAppRouter() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parsePathname(window.location.pathname),
  );

  useEffect(() => {
    const onPopState = () => {
      startTransition(() => {
        setRoute(parsePathname(window.location.pathname));
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigate(nextRoute: AppRoute) {
    const nextPath = routeToPath(nextRoute);
    if (nextPath === window.location.pathname) {
      return;
    }

    window.history.pushState({}, "", nextPath);
    startTransition(() => {
      setRoute(nextRoute);
    });
  }

  return { route, navigate };
}
