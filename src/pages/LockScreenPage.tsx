import { useEffect, useState } from "react";
import { LockOverlay } from "../components";
import { appService, lockService } from "../services";
import type { AppStatus } from "../types";

export function LockScreenPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setStatus(await appService.getStatus());
  }

  async function unlock(password: string) {
    const result = await lockService.unlock(password);
    if (result.success) {
      setMessage("解锁成功");
    } else {
      setMessage(result.message);
    }
    await refresh();
  }

  async function unlockWithUsbKey() {
    const result = await lockService.unlockWithUsbKey();
    if (result.success) {
      setMessage("解锁成功");
    } else {
      setMessage(result.message);
    }
    await refresh();
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, []);

  return (
    <LockOverlay
      visible
      message={message}
      mode={status?.activeMode}
      onUnlock={unlock}
      onUsbUnlock={unlockWithUsbKey}
    />
  );
}
