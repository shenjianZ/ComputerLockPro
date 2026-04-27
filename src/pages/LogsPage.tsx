import { useEffect, useState } from "react";
import { EventsPanel } from "../components";
import { lockService } from "../services";
import type { LockEvent } from "../types";

export function LogsPage() {
  const [events, setEvents] = useState<LockEvent[]>([]);
  const [message, setMessage] = useState("");

  async function refresh() {
    setEvents(await lockService.listEvents(50));
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, []);

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Logs</p>
        <h1>本地安全事件</h1>
        {message && <p className="muted">{message}</p>}
      </section>
      <EventsPanel events={events} />
    </>
  );
}
