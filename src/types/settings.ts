import type { LockMode } from "./lock";

export interface AppSettings {
  autoStartEnabled: boolean;
  preventSleepEnabled: boolean;
  defaultLockMode: LockMode;
  multiDisplayEnabled: boolean;
  unlockHotkey: string;
  passwordSet: boolean;
}
