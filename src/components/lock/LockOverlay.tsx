import { useEffect, useState } from "react";
import { KeyRound, Usb } from "lucide-react";
import type { LockMode } from "../../types";

interface LockOverlayProps {
  visible: boolean;
  message: string;
  mode?: LockMode | null;
  onUnlock: (password: string) => Promise<void>;
  onUsbUnlock?: () => Promise<void>;
}

export function LockOverlay({ visible, message, mode, onUnlock, onUsbUnlock }: LockOverlayProps) {
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!visible) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!password.trim()) return;
    setUnlocking(true);
    try {
      await onUnlock(password);
      setPassword("");
    } finally {
      setUnlocking(false);
    }
  }

  async function handleUsbUnlock() {
    if (!onUsbUnlock) return;
    setUnlocking(true);
    try {
      await onUsbUnlock();
    } finally {
      setUnlocking(false);
    }
  }

  const isError = message.includes("错误") || message.includes("失败") || message.includes("过多");

  return (
    <div className={`lock-overlay mode-${mode?.toLowerCase() ?? "transparent"}`}>
      {mode === "Clock" && (
        <div className="lock-clock">
          <strong>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
          <span>{time.toLocaleDateString()}</span>
        </div>
      )}
      <form className="unlock-box" onSubmit={handleSubmit}>
        <KeyRound size={24} />
        <h2>ComputerLock Pro</h2>
        <p style={isError ? { color: "#f87171", fontSize: 13 } : { fontSize: 13 }}>
          {message || "输入锁屏密码解锁"}
        </p>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder="解锁密码"
          disabled={unlocking}
        />
        <button type="submit" disabled={unlocking || !password.trim()}>
          {unlocking ? "验证中..." : "解锁"}
        </button>
        {onUsbUnlock && (
          <button type="button" onClick={handleUsbUnlock} disabled={unlocking} style={{ background: "#374151" }}>
            <Usb size={14} />
            USB Key 解锁
          </button>
        )}
      </form>
    </div>
  );
}
