import { useEffect, useState } from "react";
import { LockOverlay } from "../components";
import { appService, lockService, settingsService } from "../services";
import type { AppStatus, AppSettings } from "../types";

export function LockScreenPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setStatus(await appService.getStatus());
  }

  async function unlock(password: string) {
    try {
      const result = await lockService.unlock(password);
      if (result.success) {
        setMessage("解锁成功");
      } else {
        setMessage(result.message);
      }
      await refresh();
    } catch (e) {
      setMessage(`解锁失败：${e}`);
    }
  }

  async function unlockWithUsbKey() {
    try {
      const result = await lockService.unlockWithUsbKey();
      if (result.success) {
        setMessage("解锁成功");
      } else {
        setMessage(result.message);
      }
      await refresh();
    } catch (e) {
      setMessage(`解锁失败：${e}`);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const [appStatus, appSettings] = await Promise.all([
          appService.getStatus(),
          settingsService.getSettings(),
        ]);
        setStatus(appStatus);
        setSettings(appSettings);
      } catch (error) {
        setMessage(String(error));
      }
    }
    init();
  }, []);

  return (
    <LockOverlay
      visible
      message={message}
      mode={status?.activeMode}
      wallpaperPath={settings?.wallpaperPath}
      onUnlock={unlock}
      onUsbUnlock={unlockWithUsbKey}
    />
  );
}
