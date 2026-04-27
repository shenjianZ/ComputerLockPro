import { useEffect, useState } from "react";
import { EventsPanel } from "../components";
import { useToast } from "../components/common";
import { lockService } from "../services";
import type { LockEvent } from "../types";

export function LogsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<LockEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [exportText, setExportText] = useState("");

  async function refresh() {
    setEvents(await lockService.queryEvents(filter || null, 50));
  }

  async function clearEvents() {
    await lockService.clearEvents();
    toast("日志已清空", "success");
    await refresh();
  }

  async function exportEvents(format: "json" | "csv") {
    setExportText(await lockService.exportEvents(format));
    toast(`已导出 ${format.toUpperCase()} 格式`, "success");
  }

  useEffect(() => {
    refresh().catch((e) => toast(String(e), "error"));
  }, [filter]);

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Logs</p>
        <h1>安全日志</h1>
        <p className="hero-copy">本地锁定事件记录与导出</p>
      </section>
      <EventsPanel
        events={events}
        filter={filter}
        onFilter={setFilter}
        onClear={clearEvents}
        onExport={exportEvents}
      />
      {exportText && <pre className="export-preview">{exportText}</pre>}
    </>
  );
}
