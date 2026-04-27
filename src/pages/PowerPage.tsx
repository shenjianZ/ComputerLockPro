import { useEffect, useState } from "react";
import { SettingsPanel } from "../components";
import { powerService, settingsService } from "../services";
import type { AppSettings } from "../types";

export function PowerPage() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [powerAction, setPowerAction] = useState("shutdown");
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [ruleCondition, setRuleCondition] = useState("idle");
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

  async function updateSettings(next: AppSettings) {
    setSettings(await settingsService.updateSettings(next));
  }

  async function schedulePowerAction() {
    const result = await powerService.scheduleAction(powerAction, delayMinutes);
    setMessage(result.message);
  }

  async function cancelPowerAction() {
    const result = await powerService.cancelAction();
    setMessage(result.message);
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
        onSettingsChange={updateSettings}
      />
      <section className="panel settings-grid">
        <label className="form-stack">
          <strong>电源动作</strong>
          <select value={powerAction} onChange={(event) => setPowerAction(event.currentTarget.value)}>
            <option value="shutdown">倒计时关机</option>
            <option value="sleep">倒计时休眠</option>
          </select>
        </label>
        <label className="form-stack">
          <strong>倒计时分钟</strong>
          <input type="number" min="1" value={delayMinutes} onChange={(event) => setDelayMinutes(Number(event.currentTarget.value))} />
        </label>
        <button type="button" onClick={schedulePowerAction}>创建电源计划</button>
        <button type="button" onClick={cancelPowerAction}>取消关机计划</button>
      </section>
      <section className="panel settings-grid">
        <label className="form-stack">
          <strong>自动化规则条件</strong>
          <select value={ruleCondition} onChange={(event) => setRuleCondition(event.currentTarget.value)}>
            <option value="idle">空闲时长</option>
            <option value="time">指定时间</option>
            <option value="battery">电量阈值</option>
            <option value="network">网络状态</option>
          </select>
        </label>
        <p className="muted">当前规则：当{ruleCondition}触发时执行锁屏、休眠或提醒。</p>
      </section>
    </>
  );
}
