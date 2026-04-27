import { ToggleRow } from "../common";
import type { AppSettings } from "../../types";

interface SettingsPanelProps {
  settings: AppSettings | null;
  onAutostart: (enabled: boolean) => void;
  onPreventSleep: (enabled: boolean) => void;
  onSettingsChange: (settings: AppSettings) => void;
}

export function SettingsPanel({
  settings,
  onAutostart,
  onPreventSleep,
  onSettingsChange,
}: SettingsPanelProps) {
  function patchSettings(patch: Partial<AppSettings>) {
    if (settings) onSettingsChange({ ...settings, ...patch });
  }

  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">系统能力</p>
        <h2>安全与电源</h2>
      </div>
      <ToggleRow
        title="开机自启"
        description="登录 Windows 后自动启动并驻留托盘"
        checked={settings?.autoStartEnabled ?? false}
        onCheckedChange={onAutostart}
      />
      <ToggleRow
        title="防休眠"
        description="锁屏或执行长任务时保持系统唤醒"
        checked={settings?.preventSleepEnabled ?? false}
        onCheckedChange={onPreventSleep}
      />
      <div className="settings-grid" style={{ marginTop: 8 }}>
        <label className="form-stack">
          <strong style={{ fontSize: 13 }}>默认锁屏模式</strong>
          <select value={settings?.defaultLockMode ?? "Transparent"} onChange={(event) => patchSettings({ defaultLockMode: event.currentTarget.value as AppSettings["defaultLockMode"] })}>
            <option value="Transparent">透明</option>
            <option value="Black">黑屏</option>
            <option value="Blur">模糊</option>
            <option value="Wallpaper">壁纸</option>
            <option value="Clock">时钟</option>
          </select>
        </label>
        <label className="form-stack">
          <strong style={{ fontSize: 13 }}>多屏策略</strong>
          <select value={settings?.multiDisplayStrategy ?? "all"} onChange={(event) => patchSettings({ multiDisplayStrategy: event.currentTarget.value })}>
            <option value="all">覆盖所有屏幕</option>
            <option value="primary">仅主屏</option>
          </select>
        </label>
        <label className="form-stack">
          <strong style={{ fontSize: 13 }}>主题</strong>
          <select value={settings?.theme ?? "system"} onChange={(event) => patchSettings({ theme: event.currentTarget.value })}>
            <option value="system">跟随系统</option>
            <option value="light">浅色</option>
            <option value="dark">暗色</option>
          </select>
        </label>
        <label className="form-stack">
          <strong style={{ fontSize: 13 }}>USB Key 路径</strong>
          <input value={settings?.usbKeyPath ?? ""} onChange={(event) => patchSettings({ usbKeyPath: event.currentTarget.value || null })} placeholder="E:\\computerlock.key" />
        </label>
        <label className="form-stack">
          <strong style={{ fontSize: 13 }}>蓝牙设备名</strong>
          <input value={settings?.bluetoothDeviceName ?? ""} onChange={(event) => patchSettings({ bluetoothDeviceName: event.currentTarget.value || null })} placeholder="例如 我的手机" />
        </label>
      </div>
    </section>
  );
}
