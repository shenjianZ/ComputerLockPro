import { useEffect, useState } from "react";
import { LockPanel, StatusCards } from "../components";
import { appService, lockService } from "../services";
import type { AppStatus, LockMode } from "../types";

export function LockPage() {
  const [status, setStatus] = useState<AppStatus | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setStatus(await appService.getStatus());
  }

  async function lock(mode: LockMode) {
    await lockService.lock(mode);
    setMessage(mode === "Black" ? "黑屏锁定中" : "透明锁定中");
    await refresh();
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, []);

  return (
    <>
      <LockPanel onLock={lock} disabled={status?.isLocked} />
      <StatusCards status={status} />
      {message && <p className="muted">{message}</p>}
    </>
  );
}
