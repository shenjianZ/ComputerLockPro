import type { ReactNode } from "react";
import { routeItems, type AppRoute } from "../router";

interface AppLayoutProps {
  children: ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export function AppLayout({ children, activeRoute, onNavigate }: AppLayoutProps) {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">CL</span>
          <div>
            <strong>ComputerLock</strong>
            <p>桌面安全 · 专注管理</p>
          </div>
        </div>
        {routeItems.map((item) => (
          <button
            className={activeRoute === item.id ? "nav-item active" : "nav-item"}
            key={item.id}
            onClick={() => onNavigate(item.id)}
            type="button"
          >
            <item.icon size={17} />
            {item.label}
          </button>
        ))}
      </aside>
      <section className="workspace">
        <section className="content">{children}</section>
      </section>
    </main>
  );
}
