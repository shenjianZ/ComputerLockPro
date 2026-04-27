import { useEffect, useState } from "react";
import { EventsPanel } from "../components";
import { lockService } from "../services";
import type { LockEvent } from "../types";

export function LogsPage() {
  const [events, setEvents] = useState<LockEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [exportText, setExportText] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setEvents(await lockService.queryEvents(filter || null, 50));
  }

  async function clearEvents() {
    await lockService.clearEvents();
    await refresh();
  }

  async function exportEvents(format: "json" | "csv") {
    setExportText(await lockService.exportEvents(format));
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, [filter]);

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Logs</p>
        <h1>本地安全事件</h1>
        {message && <p className="muted">{message}</p>}
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
