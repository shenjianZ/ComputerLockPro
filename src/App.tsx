import { AppLayout } from "./layouts";
import { FocusPage, LockPage, LockScreenPage, LogsPage, PowerPage } from "./pages";
import { useHashRoute } from "./router";
import { isLockWindow } from "./utils";
import "./App.css";

function App() {
  if (isLockWindow()) {
    return <LockScreenPage />;
  }

  const { route, navigate } = useHashRoute();

  return (
    <AppLayout activeRoute={route} onNavigate={navigate}>
      {route === "lock" && <LockPage />}
      {route === "focus" && <FocusPage />}
      {route === "power" && <PowerPage />}
      {route === "logs" && <LogsPage />}
    </AppLayout>
  );
}

export default App;
