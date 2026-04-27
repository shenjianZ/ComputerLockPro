import { useEffect, useState } from "react";
import { LockOverlay } from "../components";
import { appService, lockService } from "../services";
import type { AppStatus } from "../types";

export function LockScreenPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [message, setMessage] = useState("输入密码解锁，默认密码为 123456。");

  async function refresh() {
    setStatus(await appService.getStatus());
  }

  async function unlock(password: string) {
    const result = await lockService.unlock(password);
    setMessage(result.message);
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
    />
  );
}
