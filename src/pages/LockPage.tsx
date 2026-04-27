import { useEffect, useState } from "react";
import { LockPanel, StatusCards } from "../components";
import { useToast } from "../components/common";
import { appService, lockService, passwordService } from "../services";
import type { AppStatus, LockMode, PasswordStatus } from "../types";

export function LockPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);

  async function refresh() {
    setStatus(await appService.getStatus());
    setPasswordStatus(await passwordService.getStatus());
  }

  async function lock(mode: LockMode) {
    try {
      await lockService.lock(mode);
      const names: Record<LockMode, string> = {
        Transparent: "透明锁屏",
        Black: "黑屏锁屏",
        Blur: "模糊锁屏",
        Wallpaper: "壁纸锁屏",
        Clock: "时钟锁屏",
      };
      toast(`${names[mode]}已启动`, "success");
      setTimeout(() => refresh(), 200);
    } catch (e) {
      toast(String(e), "error");
      await refresh();
    }
  }

  useEffect(() => {
    refresh().catch((e) => toast(String(e), "error"));
  }, []);

  return (
    <>
      <LockPanel
        onLock={lock}
        disabled={status?.isLocked || !passwordStatus?.passwordSet}
      />
      <StatusCards status={status} />
    </>
  );
}
