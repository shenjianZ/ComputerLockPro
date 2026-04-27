import { tauriClient } from "../api";

export const powerService = {
  setAutostart: (enabled: boolean) => tauriClient.setAutostart(enabled),
  setPreventSleep: (enabled: boolean) =>
    tauriClient.setPreventSleep(enabled),
  scheduleAction: (action: string, delayMinutes: number) =>
    tauriClient.schedulePowerAction(action, delayMinutes),
  cancelAction: () => tauriClient.cancelPowerAction(),
};
