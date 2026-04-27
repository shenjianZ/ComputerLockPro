import { useEffect, useState } from "react";
import { SettingsPanel } from "../components";
import { powerService, settingsService } from "../services";
import type { AppSettings } from "../types";

export function PowerPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [message, setMessage] = useState("");

  async function refresh() {
    setSettings(await settingsService.getSettings());
  }

  async function setAutostart(enabled: boolean) {
    await powerService.setAutostart(enabled);
    await refresh();
  }

  async function setPreventSleep(enabled: boolean) {
    await powerService.setPreventSleep(enabled);
    await refresh();
  }

  useEffect(() => {
    refresh().catch((error) => setMessage(String(error)));
  }, []);

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Power</p>
        <h1>电源与启动策略</h1>
        {message && <p className="muted">{message}</p>}
      </section>
      <SettingsPanel
        settings={settings}
        onAutostart={setAutostart}
        onPreventSleep={setPreventSleep}
      />
    </>
  );
}
