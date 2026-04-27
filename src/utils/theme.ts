export type ThemeMode = "system" | "light" | "dark";

export function applyTheme(theme: string | null | undefined) {
  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  if (theme === "light") {
    root.classList.add("theme-light");
  }
  if (theme === "dark") {
    root.classList.add("theme-dark");
  }
}
