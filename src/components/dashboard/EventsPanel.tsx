import { Clock3 } from "lucide-react";
import type { LockEvent } from "../../types";

interface EventsPanelProps {
  events: LockEvent[];
  filter: string;
  onFilter: (value: string) => void;
  onClear: () => void;
  onExport: (format: "json" | "csv") => void;
}

export function EventsPanel({ events, filter, onFilter, onClear, onExport }: EventsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">本地日志</p>
        <h2>锁定事件</h2>
      </div>
      <div className="toolbar">
        <select value={filter} onChange={(event) => onFilter(event.currentTarget.value)}>
          <option value="">全部事件</option>
          <option value="locked">锁屏</option>
          <option value="unlocked">解锁成功</option>
          <option value="unlock_failed">密码错误</option>
          <option value="password_changed">密码修改</option>
          <option value="password_reset">密码重置</option>
        </select>
        <button type="button" onClick={() => onExport("json")}>导出 JSON</button>
        <button type="button" onClick={() => onExport("csv")}>导出 CSV</button>
        <button type="button" onClick={onClear}>清空日志</button>
      </div>
      <div className="event-list">
        {events.map((event) => (
          <article className="event-item" key={event.id}>
            <Clock3 size={16} />
            <div>
              <strong>{event.message}</strong>
              <p>
                {event.eventType}
                {event.mode ? ` · ${event.mode}` : ""}
                {" · "}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </div>
          </article>
        ))}
        {events.length === 0 && <p className="muted">暂无事件记录</p>}
      </div>
    </section>
  );
}
