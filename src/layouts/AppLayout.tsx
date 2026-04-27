import type { ReactNode } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";
import { routeItems, type AppRoute } from "../router";

interface AppLayoutProps {
  children: ReactNode;
  activeRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

function handleWindowAction(action: "minimize" | "maximize" | "close") {
  const appWindow = getCurrentWindow();
  if (action === "minimize") {
    void appWindow.minimize();
    return;
  }
  if (action === "maximize") {
    void appWindow.toggleMaximize();
    return;
  }
  void appWindow.close();
}

export function AppLayout({ children, activeRoute, onNavigate }: AppLayoutProps) {
  return (
    <main className="app-shell">
      <header className="app-titlebar" data-tauri-drag-region>
        <div className="titlebar-brand" data-tauri-drag-region>
          <span className="brand-mark">CL</span>
          <strong data-tauri-drag-region>ComputerLock Pro</strong>
        </div>
        <div className="window-controls">
          <button aria-label="最小化" className="window-control" onClick={() => handleWindowAction("minimize")} type="button">
            <Minus size={14} />
          </button>
          <button aria-label="最大化" className="window-control" onClick={() => handleWindowAction("maximize")} type="button">
            <Square size={12} />
          </button>
          <button aria-label="关闭" className="window-control close" onClick={() => handleWindowAction("close")} type="button">
            <X size={14} />
          </button>
        </div>
      </header>
      <div className="app-body">
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
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </aside>
        <section className="workspace">
          <section className="content">{children}</section>
        </section>
      </div>
    </main>
  );
}
