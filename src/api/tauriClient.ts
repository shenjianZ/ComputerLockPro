import { invoke } from "@tauri-apps/api/core";
import type {
  AppSettings,
  AppStatus,
  AutostartStatus,
  LockEvent,
  LockMode,
  LockSession,
  PowerStatus,
  UnlockResult,
} from "../types";

export const tauriClient = {
  getAppStatus: () => invoke<AppStatus>("get_app_status"),
  getSettings: () => invoke<AppSettings>("get_settings"),
  updateSettings: (settings: AppSettings) =>
    invoke<AppSettings>("update_settings", { settings }),
  lockScreen: (mode: LockMode) =>
    invoke<LockSession>("lock_screen", { mode }),
  unlockScreen: (password: string) =>
    invoke<UnlockResult>("unlock_screen", { password }),
  setPreventSleep: (enabled: boolean) =>
    invoke<PowerStatus>("set_prevent_sleep", { enabled }),
  setAutostart: (enabled: boolean) =>
    invoke<AutostartStatus>("set_autostart", { enabled }),
  getLockEvents: (limit = 20) =>
    invoke<LockEvent[]>("get_lock_events", { limit }),
};
