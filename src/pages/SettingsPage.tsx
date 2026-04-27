import { useEffect, useState } from "react";
import { PasswordPanel, SettingsPanel } from "../components";
import { useToast } from "../components/common";
import { passwordService, powerService, settingsService } from "../services";
import type { AppSettings, PasswordStatus, SetupPasswordResult } from "../types";
import { applyTheme } from "../utils";

export function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AppSettings | null>(() => settingsService.getCachedSettings());
  const [passwordStatus, setPasswordStatus] = useState<PasswordStatus | null>(null);

  async function refresh() {
    const [nextSettings, nextPasswordStatus] = await Promise.all([
      settingsService.getSettings(),
      passwordService.getStatus(),
    ]);
    setSettings(nextSettings);
    setPasswordStatus(nextPasswordStatus);
  }

  async function setAutostart(enabled: boolean) {
    await powerService.setAutostart(enabled);
    toast(enabled ? "开机自启已开启" : "开机自启已关闭", "success");
    await refresh();
  }

  async function setPreventSleep(enabled: boolean) {
    await powerService.setPreventSleep(enabled);
    toast(enabled ? "防休眠已开启" : "防休眠已关闭", "success");
    await refresh();
  }

  async function updateSettings(next: AppSettings) {
    const saved = await settingsService.updateSettings(next);
    applyTheme(saved.theme);
    setSettings(saved);
  }

  async function setupPassword(password: string): Promise<SetupPasswordResult> {
    const result = await passwordService.setup(password);
    await refresh();
    return result;
  }

  async function changePassword(oldPassword: string, newPassword: string) {
    const result = await passwordService.change(oldPassword, newPassword);
    await refresh();
    return result;
  }

  async function resetPassword(recoveryCode: string, newPassword: string) {
    const result = await passwordService.resetWithRecoveryCode(recoveryCode, newPassword);
    await refresh();
    return result;
  }

  useEffect(() => {
    refresh().catch((e) => toast(String(e), "error"));
  }, []);

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Settings</p>
        <h1>系统设置</h1>
        <p className="hero-copy">密码、安全选项和系统配置</p>
      </section>
      <PasswordPanel
        status={passwordStatus}
        onSetup={setupPassword}
        onChange={changePassword}
        onReset={resetPassword}
        onToast={toast}
      />
      <SettingsPanel
        settings={settings}
        onAutostart={setAutostart}
        onPreventSleep={setPreventSleep}
        onSettingsChange={updateSettings}
      />
    </>
  );
}
