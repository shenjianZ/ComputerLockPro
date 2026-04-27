import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { isLockWindow } from "./utils";

if (isLockWindow()) {
  document.documentElement.classList.add("lock-window");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
