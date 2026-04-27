import { MonitorOff, Shield } from "lucide-react";
import type { LockMode } from "../../types";

interface LockPanelProps {
  onLock: (mode: LockMode) => void;
  disabled?: boolean;
}

export function LockPanel({ onLock, disabled }: LockPanelProps) {
  return (
    <section className="panel hero-panel">
      <div>
        <p className="eyebrow">ComputerLock Pro</p>
        <h1>桌面锁定、防误触与专注控制中心</h1>
        <p className="hero-copy">
          托盘常驻、快捷锁定、本地 SQLite、开机自启与日志能力已经接入，
          首版以低权限、稳定可用为核心。
        </p>
      </div>
      <div className="action-row">
        <button disabled={disabled} onClick={() => onLock("Transparent")}>
          <Shield size={18} />
          透明锁屏
        </button>
        <button disabled={disabled} onClick={() => onLock("Black")}>
          <MonitorOff size={18} />
          黑屏锁屏
        </button>
      </div>
    </section>
  );
}
