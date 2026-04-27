import { useState } from "react";
import { KeyRound } from "lucide-react";
import type { LockMode } from "../../types";

interface LockOverlayProps {
  visible: boolean;
  message: string;
  mode?: LockMode | null;
  onUnlock: (password: string) => void;
}

export function LockOverlay({ visible, message, mode, onUnlock }: LockOverlayProps) {
  const [password, setPassword] = useState("");

  if (!visible) return null;

  return (
    <div className={`lock-overlay ${mode === "Black" ? "black" : ""}`}>
      <form className="unlock-box" onSubmit={(event) => {
        event.preventDefault();
        onUnlock(password);
      }}>
        <KeyRound size={28} />
        <h2>ComputerLock Pro</h2>
        <p>{message || "输入密码解锁，默认密码为 123456。"}</p>
        <input autoFocus type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} placeholder="解锁密码" />
        <button type="submit">解锁</button>
      </form>
    </div>
  );
}
