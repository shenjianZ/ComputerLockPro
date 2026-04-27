import { tauriClient } from "../api";

export const systemGuardService = {
  blockApp: (processName: string) => tauriClient.blockApp(processName),
  setWebsiteBlock: (domain: string, enabled: boolean) =>
    tauriClient.setWebsiteBlock(domain, enabled),
  lockInput: (seconds: number) => tauriClient.lockSystemInput(seconds),
  checkUsbKey: () => tauriClient.checkUsbKey(),
  checkBluetooth: () => tauriClient.checkBluetoothDevice(),
  lockIfBluetoothMissing: () => tauriClient.lockIfBluetoothMissing(),
};
