export function isLockWindow() {
  return new URLSearchParams(window.location.search).get("lock") === "1";
}
