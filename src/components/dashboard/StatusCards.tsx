import { Database, LockKeyhole, Moon, Power } from "lucide-react";
import type { AppStatus } from "../../types";

interface StatusCardsProps {
  status: AppStatus | null;
}

export function StatusCards({ status }: StatusCardsProps) {
  const cards = [
    { label: "锁定状态", value: status?.isLocked ? "已锁定" : "待命", icon: LockKeyhole },
    { label: "防休眠", value: status?.preventSleepEnabled ? "开启" : "关闭", icon: Moon },
    { label: "开机自启", value: status?.autoStartEnabled ? "开启" : "关闭", icon: Power },
    { label: "本地数据", value: status?.databaseReady ? "正常" : "检查中", icon: Database },
  ];

  return (
    <section className="status-grid">
      {cards.map((card) => (
        <article className="status-card" key={card.label}>
          <card.icon size={20} />
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </section>
  );
}
