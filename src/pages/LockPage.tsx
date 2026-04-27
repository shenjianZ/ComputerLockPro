import { useCallback, useEffect, useState } from "react";
import { LockPanel, StatusCards } from "../components";
import { useToast } from "../components/common";
import { appService, lockService } from "../services";
import type { AppStatus, LockMode } from "../types";

export function LockPage() {
  const { toast } = useToast();
  const [status, setStatus] = useState<AppStatus | null>(() => appService.getCachedStatus());

  const refresh = useCallback(async () => {
    setStatus(await appService.getStatus());
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
        disabled={status?.isLocked}
      />
      <StatusCards status={status} />
    </>
  );
}
