import type { LockMode } from "./lock";

export interface AppSettings {
  autoStartEnabled: boolean;
  preventSleepEnabled: boolean;
  defaultLockMode: LockMode;
  multiDisplayEnabled: boolean;
  multiDisplayStrategy: string;
  unlockHotkey: string;
  passwordSet: boolean;
  passwordMigrationRequired: boolean;
  theme: string;
  wallpaperPath: string | null;
  usbKeyPath: string | null;
  bluetoothDeviceName: string | null;
}
