import { BarChart3, LockKeyhole, Moon, Power } from "lucide-react";

export type AppRoute = "lock" | "focus" | "power" | "logs";

export const defaultRoute: AppRoute = "lock";

export const routeItems = [
  { id: "lock", label: "锁屏中心", icon: LockKeyhole },
  { id: "focus", label: "专注模式", icon: Moon },
  { id: "power", label: "电源管理", icon: Power },
  { id: "logs", label: "安全日志", icon: BarChart3 },
] satisfies Array<{
  id: AppRoute;
  label: string;
  icon: typeof LockKeyhole;
}>;

export function parseRoute(hash: string): AppRoute {
  const route = hash.replace(/^#\/?/, "");
  return routeItems.some((item) => item.id === route)
    ? (route as AppRoute)
    : defaultRoute;
}
