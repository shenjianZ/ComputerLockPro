import { tauriClient } from "../api";
import type { AppSettings } from "../types";

export const settingsService = {
  getSettings: () => tauriClient.getSettings(),
  updateSettings: (settings: AppSettings) =>
    tauriClient.updateSettings(settings),
};
