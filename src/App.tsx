import { useEffect } from "react";
import { ToastProvider } from "./components/common";
import { AppLayout } from "./layouts";
import { FocusPage, LockPage, LockScreenPage, LogsPage, PowerPage, SettingsPage, ShieldPage } from "./pages";
import { useHashRoute } from "./router";
import { appService, settingsService } from "./services";
import { applyTheme, isLockWindow } from "./utils";
import "./App.css";

function App() {
  if (isLockWindow()) {
    return <LockScreenPage />;
  }

  return <MainApp />;
}

function MainApp() {
  useEffect(() => {
    settingsService.getSettings().then((settings) => applyTheme(settings.theme)).catch(() => {});
    appService.getStatus().catch(() => {});
  }, []);

  const { route, navigate } = useHashRoute();

  return (
    <ToastProvider>
      <AppLayout activeRoute={route} onNavigate={navigate}>
        {route === "lock" && <LockPage />}
        {route === "focus" && <FocusPage />}
        {route === "shield" && <ShieldPage />}
        {route === "power" && <PowerPage />}
        {route === "logs" && <LogsPage />}
        {route === "settings" && <SettingsPage />}
      </AppLayout>
    </ToastProvider>
  );
}

export default App;
