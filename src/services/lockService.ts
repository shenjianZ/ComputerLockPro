import { tauriClient } from "../api";
import type { LockMode } from "../types";

export const lockService = {
  lock: (mode: LockMode) => tauriClient.lockScreen(mode),
  unlock: (password: string) => tauriClient.unlockScreen(password),
  unlockWithUsbKey: () => tauriClient.unlockWithUsbKey(),
  listEvents: (limit = 20) => tauriClient.getLockEvents(limit),
  queryEvents: (eventType: string | null, limit = 50) =>
    tauriClient.queryLockEvents(eventType, limit),
  clearEvents: () => tauriClient.clearLockEvents(),
  exportEvents: (format: "json" | "csv") =>
    tauriClient.exportLockEvents(format),
};
