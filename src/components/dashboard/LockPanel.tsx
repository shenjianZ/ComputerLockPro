import { Clock3, Image, MonitorOff, Shield, Sparkles } from "lucide-react";
import type { LockMode } from "../../types";

interface LockPanelProps {
  onLock: (mode: LockMode) => void;
  disabled?: boolean;
}

const MODES: { mode: LockMode; label: string; icon: typeof Shield }[] = [
  { mode: "Transparent", label: "透明", icon: Shield },
  { mode: "Black", label: "黑屏", icon: MonitorOff },
  { mode: "Blur", label: "模糊", icon: Sparkles },
  { mode: "Wallpaper", label: "壁纸", icon: Image },
  { mode: "Clock", label: "时钟", icon: Clock3 },
];

export function LockPanel({ onLock, disabled }: LockPanelProps) {
  return (
    <section className="panel hero-panel">
      <div>
        <h2>桌面锁定</h2>
        <p className="muted" style={{ fontSize: 13 }}>
          选择锁屏模式启动桌面保护
        </p>
      </div>
      <div className="action-row">
        {MODES.map(({ mode, label, icon: Icon }) => (
          <button key={mode} disabled={disabled} onClick={() => onLock(mode)} type="button">
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}
