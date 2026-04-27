import { tauriClient } from "../api";

export const passwordService = {
  getStatus: () => tauriClient.getPasswordStatus(),
  setup: (password: string) => tauriClient.setupPassword(password),
  change: (oldPassword: string, newPassword: string) =>
    tauriClient.changePassword(oldPassword, newPassword),
  resetWithRecoveryCode: (recoveryCode: string, newPassword: string) =>
    tauriClient.resetPasswordWithRecoveryCode(recoveryCode, newPassword),
};
