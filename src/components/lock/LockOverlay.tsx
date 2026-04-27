import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";
import type { LockMode } from "../../types";

interface LockOverlayProps {
  visible: boolean;
  message: string;
  mode?: LockMode | null;
  onUnlock: (password: string) => void;
  onUsbUnlock?: () => void;
}

export function LockOverlay({ visible, message, mode, onUnlock, onUsbUnlock }: LockOverlayProps) {
  const [password, setPassword] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={`lock-overlay mode-${mode?.toLowerCase() ?? "transparent"}`}>
      {mode === "Clock" && (
        <div className="lock-clock">
          <strong>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
          <span>{time.toLocaleDateString()}</span>
        </div>
      )}
      <form className="unlock-box" onSubmit={(event) => {
        event.preventDefault();
        onUnlock(password);
      }}>
        <KeyRound size={28} />
        <h2>ComputerLock Pro</h2>
        <p>{message || "输入锁屏密码解锁。"}</p>
        <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} placeholder="解锁密码" />
        <button type="submit">解锁</button>
        {onUsbUnlock && <button type="button" onClick={onUsbUnlock}>USB Key 解锁</button>}
      </form>
    </div>
  );
}
