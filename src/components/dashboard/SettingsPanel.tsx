import { ToggleRow } from "../common";
import type { AppSettings } from "../../types";

interface SettingsPanelProps {
  settings: AppSettings | null;
  onAutostart: (enabled: boolean) => void;
  onPreventSleep: (enabled: boolean) => void;
}

export function SettingsPanel({
  settings,
  onAutostart,
  onPreventSleep,
}: SettingsPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">系统能力</p>
        <h2>安全与电源</h2>
      </div>
      <ToggleRow
        title="开机自启"
        description="登录 Windows 后自动启动并驻留托盘。"
        checked={settings?.autoStartEnabled ?? false}
        onCheckedChange={onAutostart}
      />
      <ToggleRow
        title="防休眠"
        description="锁屏或执行长任务时保持系统唤醒。"
        checked={settings?.preventSleepEnabled ?? false}
        onCheckedChange={onPreventSleep}
      />
    </section>
  );
}
