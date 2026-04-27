import { useState } from "react";
import { useToast } from "../components/common";
import { powerService } from "../services";

export function PowerPage() {
  const { toast } = useToast();
  const [powerAction, setPowerAction] = useState("shutdown");
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [ruleCondition, setRuleCondition] = useState("idle");

  async function schedulePowerAction() {
    try {
      const result = await powerService.scheduleAction(powerAction, delayMinutes);
      toast(result.message, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function cancelPowerAction() {
    try {
      const result = await powerService.cancelAction();
      toast(result.message, "info");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Power</p>
        <h1>电源管理</h1>
        <p className="hero-copy">电源计划与自动化策略</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>电源计划</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="form-inline">
            <strong>电源动作</strong>
            <select value={powerAction} onChange={(event) => setPowerAction(event.currentTarget.value)}>
              <option value="shutdown">倒计时关机</option>
              <option value="sleep">倒计时休眠</option>
            </select>
          </label>
          <label className="form-inline">
            <strong>倒计时（分钟）</strong>
            <input type="number" min="1" value={delayMinutes} onChange={(event) => setDelayMinutes(Number(event.currentTarget.value))} />
          </label>
        </div>
        <div className="action-row" style={{ marginTop: 10 }}>
          <button type="button" onClick={schedulePowerAction}>创建电源计划</button>
          <button type="button" onClick={cancelPowerAction}>取消计划</button>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>自动化规则</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="form-inline">
            <strong>规则条件</strong>
            <select value={ruleCondition} onChange={(event) => setRuleCondition(event.currentTarget.value)}>
              <option value="idle">空闲时长</option>
              <option value="time">指定时间</option>
              <option value="battery">电量阈值</option>
              <option value="network">网络状态</option>
            </select>
          </label>
          <p className="muted" style={{ fontSize: 12 }}>当前规则：当{ruleCondition}触发时执行锁屏、休眠或提醒。</p>
        </div>
      </section>
    </>
  );
}
