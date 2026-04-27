import { useEffect, useState } from "react";
import { systemGuardService } from "../services";

export function FocusPage() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [eyeReminder, setEyeReminder] = useState(true);
  const [standReminder, setStandReminder] = useState(true);
  const [inputGuard, setInputGuard] = useState("关闭");
  const [guardMessage, setGuardMessage] = useState("");
  const [processName, setProcessName] = useState("chrome.exe");
  const [domain, setDomain] = useState("example.com");

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  async function lockInputNow() {
    const result = await systemGuardService.lockInput(15);
    setGuardMessage(result.message);
  }

  async function blockAppNow() {
    const result = await systemGuardService.blockApp(processName);
    setGuardMessage(result.message);
  }

  async function blockWebsiteNow(enabled: boolean) {
    const result = await systemGuardService.setWebsiteBlock(domain, enabled);
    setGuardMessage(result.message);
  }

  async function checkUsbKeyNow() {
    const result = await systemGuardService.checkUsbKey();
    setGuardMessage(result.message);
  }

  async function lockWhenBluetoothLeaves() {
    const result = await systemGuardService.lockIfBluetoothMissing();
    setGuardMessage(result.message);
  }

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Focus</p>
        <h1>专注模式</h1>
        <p className="hero-copy">
          番茄钟、强制休息、护眼提醒和久坐提醒已先以低权限模式落地。
        </p>
      </section>
      <section className="panel feature-grid">
        <article>
          <strong>番茄钟</strong>
          <p className="timer-text">{minutes}:{seconds}</p>
          <div className="action-row">
            <button type="button" onClick={() => setRunning((value) => !value)}>
              {running ? "暂停" : "开始"}
            </button>
            <button type="button" onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }}>
              重置
            </button>
          </div>
        </article>
        <article>
          <strong>护眼提醒</strong>
          <p className="muted">20-20-20 规则提醒：{eyeReminder ? "已启用" : "已关闭"}</p>
          <button type="button" onClick={() => setEyeReminder((value) => !value)}>
            {eyeReminder ? "关闭" : "启用"}
          </button>
        </article>
        <article>
          <strong>强制休息</strong>
          <p className="muted">久坐与强制休息提醒：{standReminder ? "已启用" : "已关闭"}</p>
          <button type="button" onClick={() => setStandReminder((value) => !value)}>
            {standReminder ? "关闭" : "启用"}
          </button>
        </article>
      </section>
      <section className="panel settings-grid">
        <label className="form-stack">
          <strong>键盘清洁模式</strong>
          <select value={inputGuard} onChange={(event) => setInputGuard(event.currentTarget.value)}>
            <option value="关闭">关闭</option>
            <option value="仅锁键盘">仅锁键盘</option>
            <option value="仅锁鼠标">仅锁鼠标</option>
            <option value="禁用快捷键">禁用特定快捷键</option>
          </select>
        </label>
        <div className="form-stack">
          <strong>可选系统增强</strong>
          <p className="muted">输入锁定使用 Windows BlockInput，应用限制使用 taskkill，网站限制写入 hosts 标记段。</p>
          <button type="button" onClick={lockInputNow}>锁定系统输入 15 秒</button>
          <button type="button" onClick={checkUsbKeyNow}>检测 USB Key</button>
          <button type="button" onClick={lockWhenBluetoothLeaves}>蓝牙离开则锁屏</button>
        </div>
      </section>
      <section className="panel settings-grid">
        <label className="form-stack">
          <strong>应用限制</strong>
          <input value={processName} onChange={(event) => setProcessName(event.currentTarget.value)} placeholder="例如 chrome.exe" />
          <button type="button" onClick={blockAppNow}>立即限制应用</button>
        </label>
        <label className="form-stack">
          <strong>网站限制</strong>
          <input value={domain} onChange={(event) => setDomain(event.currentTarget.value)} placeholder="例如 example.com" />
          <button type="button" onClick={() => blockWebsiteNow(true)}>启用限制</button>
          <button type="button" onClick={() => blockWebsiteNow(false)}>移除限制</button>
        </label>
      </section>
      {guardMessage && <p className="muted">{guardMessage}</p>}
    </>
  );
}
