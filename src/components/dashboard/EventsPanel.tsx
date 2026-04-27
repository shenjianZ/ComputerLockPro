import { Clock3 } from "lucide-react";
import type { LockEvent } from "../../types";

interface EventsPanelProps {
  events: LockEvent[];
}

export function EventsPanel({ events }: EventsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">本地日志</p>
        <h2>锁定事件</h2>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <article className="event-item" key={event.id}>
            <Clock3 size={16} />
            <div>
              <strong>{event.message}</strong>
              <p>{new Date(event.createdAt).toLocaleString()}</p>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className="muted">暂无事件记录</p>}
      </div>
    </section>
  );
}
