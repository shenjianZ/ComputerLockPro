import { ToastProvider } from "./components/common";
import { AppLayout } from "./layouts";
import { FocusPage, LockPage, LockScreenPage, LogsPage, PowerPage, SettingsPage, ShieldPage } from "./pages";
import { useHashRoute } from "./router";
import { isLockWindow } from "./utils";
import "./App.css";

function App() {
  if (isLockWindow()) {
    return <LockScreenPage />;
  }

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
