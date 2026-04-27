import { useEffect, useState } from "react";
import { defaultRoute, parseRoute, type AppRoute } from "./routes";

export function useHashRoute() {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.hash));

  useEffect(() => {
    if (!window.location.hash) {
      window.location.hash = `/${defaultRoute}`;
    }

    const handleHashChange = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function navigate(nextRoute: AppRoute) {
    window.location.hash = `/${nextRoute}`;
    setRoute(nextRoute);
  }

  return { route, navigate };
}
