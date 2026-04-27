export type LockMode = "Transparent" | "Black";

export interface LockSession {
  sessionId: string;
  mode: LockMode;
  startedAt: string;
  displayCount: number;
}

export interface UnlockResult {
  success: boolean;
  message: string;
}
