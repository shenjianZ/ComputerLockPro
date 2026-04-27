import { tauriClient } from "../api";
import type { AppStatus } from "../types";

let statusCache: AppStatus | null = null;

export const appService = {
  getStatus: async () => {
    statusCache = await tauriClient.getAppStatus();
    return statusCache;
  },
  getCachedStatus: () => statusCache,
};
