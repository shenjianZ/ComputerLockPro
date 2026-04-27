import { tauriClient } from "../api";

export const appService = {
  getStatus: () => tauriClient.getAppStatus(),
};
