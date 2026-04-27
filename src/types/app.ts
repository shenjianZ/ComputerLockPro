import type { LockMode } from "./lock";

export interface AppStatus {
  isLocked: boolean;
  activeMode: LockMode | null;
  autoStartEnabled: boolean;
  preventSleepEnabled: boolean;
  databaseReady: boolean;
}
