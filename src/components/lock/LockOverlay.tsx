import { useEffect, useState } from "react";
import { KeyRound, Usb } from "lucide-react";
import type { LockMode } from "../../types";

interface LockOverlayProps {
  visible: boolean;
  message: string;
  mode?: LockMode | null;
  wallpaperPath?: string | null;
  onUnlock: (password: string) => Promise<void>;
  onUsbUnlock?: () => Promise<void>;
}

function getOverlayStyle(mode: LockMode | null | undefined, wallpaperPath?: string | null): React.CSSProperties {
  if (mode === "Wallpaper" && wallpaperPath) {
    return {
      backgroundImage: `linear-gradient(rgba(6, 12, 23, 0.45), rgba(6, 12, 23, 0.65)), url('${wallpaperPath}')`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  }
  if (mode === "Wallpaper") {
    return {
      background: "linear-gradient(135deg, #164e63, #365314 55%, #7f1d1d)",
    };
  }
  return {};
}

export function LockOverlay({ visible, message, mode, wallpaperPath, onUnlock, onUsbUnlock }: LockOverlayProps) {
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [showUnlockBox, setShowUnlockBox] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!visible) {
      setShowUnlockBox(false);
      setPassword("");
    }
  }, [visible]);

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
  const effectiveMode = mode ?? "Transparent";
  const overlayStyle = getOverlayStyle(effectiveMode, wallpaperPath);

  return (
    <div className={`lock-overlay mode-${effectiveMode.toLowerCase()}`} style={overlayStyle}>
      {effectiveMode === "Clock" && (
        <div className="lock-clock">
          <strong>{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</strong>
          <span>{time.toLocaleDateString()}</span>
        </div>
      )}
      {!showUnlockBox && (
        <button type="button" className="unlock-entry" onClick={() => setShowUnlockBox(true)}>
          解锁
        </button>
      )}
      {showUnlockBox && (
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
      )}
    </div>
  );
}
