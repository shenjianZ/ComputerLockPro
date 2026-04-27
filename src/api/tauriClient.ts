import { invoke } from "@tauri-apps/api/core";
import type {
  AppSettings,
  AppStatus,
  AutostartStatus,
  LockEvent,
  LockMode,
  LockSession,
  PasswordActionResult,
  PasswordStatus,
  PowerScheduleResult,
  PowerStatus,
  SetupPasswordResult,
  SystemGuardResult,
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
  unlockWithUsbKey: () => invoke<UnlockResult>("unlock_with_usb_key"),
  getPasswordStatus: () => invoke<PasswordStatus>("get_password_status"),
  setupPassword: (password: string) =>
    invoke<SetupPasswordResult>("setup_password", { password }),
  changePassword: (oldPassword: string, newPassword: string) =>
    invoke<PasswordActionResult>("change_password", { oldPassword, newPassword }),
  resetPasswordWithRecoveryCode: (recoveryCode: string, newPassword: string) =>
    invoke<SetupPasswordResult>("reset_password_with_recovery_code", {
      recoveryCode,
      newPassword,
    }),
  setPreventSleep: (enabled: boolean) =>
    invoke<PowerStatus>("set_prevent_sleep", { enabled }),
  setAutostart: (enabled: boolean) =>
    invoke<AutostartStatus>("set_autostart", { enabled }),
  schedulePowerAction: (action: string, delayMinutes: number) =>
    invoke<PowerScheduleResult>("schedule_power_action", { action, delayMinutes }),
  cancelPowerAction: () => invoke<PowerScheduleResult>("cancel_power_action"),
  blockApp: (processName: string) =>
    invoke<SystemGuardResult>("block_app", { processName }),
  setWebsiteBlock: (domain: string, enabled: boolean) =>
    invoke<SystemGuardResult>("set_website_block", { domain, enabled }),
  lockSystemInput: (seconds: number) =>
    invoke<SystemGuardResult>("lock_system_input", { seconds }),
  checkUsbKey: () => invoke<SystemGuardResult>("check_usb_key"),
  checkBluetoothDevice: () => invoke<SystemGuardResult>("check_bluetooth_device"),
  lockIfBluetoothMissing: () =>
    invoke<SystemGuardResult>("lock_if_bluetooth_missing"),
  getLockEvents: (limit = 20) =>
    invoke<LockEvent[]>("get_lock_events", { limit }),
  queryLockEvents: (eventType: string | null, limit = 50) =>
    invoke<LockEvent[]>("query_lock_events", { eventType, limit }),
  clearLockEvents: () => invoke<void>("clear_lock_events"),
  exportLockEvents: (format: "json" | "csv") =>
    invoke<string>("export_lock_events", { format }),
};
