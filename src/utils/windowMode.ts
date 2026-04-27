import type { LockMode } from "../types";

const LOCK_MODES: LockMode[] = ["Transparent", "Black", "Blur", "Wallpaper", "Clock"];

export function isLockWindow() {
  return new URLSearchParams(window.location.search).get("lock") === "1";
}

export function getLockWindowMode(): LockMode | null {
  const mode = new URLSearchParams(window.location.search).get("mode");
  return LOCK_MODES.includes(mode as LockMode) ? (mode as LockMode) : null;
}
