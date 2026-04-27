import { tauriClient } from "../api";

export const powerService = {
  setAutostart: (enabled: boolean) => tauriClient.setAutostart(enabled),
  setPreventSleep: (enabled: boolean) =>
    tauriClient.setPreventSleep(enabled),
};
