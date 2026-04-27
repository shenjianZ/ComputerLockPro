import { useCallback, useEffect, useState } from "react";
import { LockPanel, StatusCards } from "../components";
import { useToast } from "../components/common";
import { appService, lockService, passwordService } from "../services";
import type { AppStatus, LockMode, PasswordStatus } from "../types";

export function LockPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);

  const refresh = useCallback(async () => {
    const [nextStatus, nextPasswordStatus] = await Promise.all([
      appService.getStatus(),
      passwordService.getStatus(),
    ]);
    setStatus(nextStatus);
    setPasswordStatus(nextPasswordStatus);
  }, []);

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
    } catch (e) {
      toast(String(e), "error");
    }
  }

  useEffect(() => {
    refresh().catch((e) => toast(String(e), "error"));

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        refresh();
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [refresh, toast]);

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
