import { tauriClient } from "../api";
import type { LockMode } from "../types";

export const lockService = {
  lock: (mode: LockMode) => tauriClient.lockScreen(mode),
  unlock: (password: string) => tauriClient.unlockScreen(password),
  listEvents: (limit = 20) => tauriClient.getLockEvents(limit),
};
