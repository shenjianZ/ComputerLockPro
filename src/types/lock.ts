export type LockMode = "Transparent" | "Black" | "Blur" | "Wallpaper" | "Clock";

export interface LockDisplayInfo {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isPrimary: boolean;
}

export interface LockSession {
  sessionId: string;
  mode: LockMode;
  startedAt: string;
  displayCount: number;
  displays: LockDisplayInfo[];
}

export interface UnlockResult {
  success: boolean;
  message: string;
}
