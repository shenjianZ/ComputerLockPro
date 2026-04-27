import { useEffect, useState } from "react";
import { LockPanel, PasswordPanel, StatusCards } from "../components";
import { appService, lockService, passwordService } from "../services";
import type { AppStatus, LockMode, PasswordStatus, SetupPasswordResult } from "../types";

export function LockPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setStatus(await appService.getStatus());
    setPasswordStatus(await passwordService.getStatus());
  }

  async function lock(mode: LockMode) {
    await lockService.lock(mode);
    const names: Record<LockMode, string> = {
      Transparent: "透明锁屏",
      Black: "黑屏锁屏",
      Blur: "模糊锁屏",
      Wallpaper: "壁纸锁屏",
      Clock: "时钟锁屏",
    };
    setMessage(`${names[mode]}已启动`);
    await refresh();
  }

  async function setupPassword(password: string): Promise<SetupPasswordResult> {
    const result = await passwordService.setup(password);
    await refresh();
    return result;
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const result = await passwordService.change(oldPassword, newPassword);
    await refresh();
    return result.message;
  }

  async function resetPassword(recoveryCode: string, newPassword: string) {
    const result = await passwordService.resetWithRecoveryCode(recoveryCode, newPassword);
    await refresh();
    return result;
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, []);

  return (
    <>
      <LockPanel onLock={lock} disabled={status?.isLocked || !passwordStatus?.passwordSet} />
      <PasswordPanel
        status={passwordStatus}
        onSetup={setupPassword}
        onChange={changePassword}
        onReset={resetPassword}
      />
      <StatusCards status={status} />
      {message && <p className="muted">{message}</p>}
    </>
  );
}
