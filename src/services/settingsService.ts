import { tauriClient } from "../api";
import type { AppSettings } from "../types";

let settingsCache: AppSettings | null = null;

export const settingsService = {
  getSettings: async () => {
    settingsCache = await tauriClient.getSettings();
    return settingsCache;
  },
  getCachedSettings: () => settingsCache,
  updateSettings: async (settings: AppSettings) => {
    settingsCache = await tauriClient.updateSettings(settings);
    return settingsCache;
  },
};
