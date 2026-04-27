import { useState } from "react";
import { systemGuardService } from "../services";
import { useToast } from "../components/common";

const LOCK_DURATIONS = [10, 15, 30, 60];

export function ShieldPage() {
  const { toast } = useToast();
  const [processName, setProcessName] = useState("");
  const [domain, setDomain] = useState("");
  const [lockDuration, setLockDuration] = useState(15);

  async function lockInputNow() {
    try {
      const result = await systemGuardService.lockInput(lockDuration);
      toast(result.message, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function blockAppNow() {
    if (!processName.trim()) {
      toast("请输入进程名", "warning");
      return;
    }
    try {
      const result = await systemGuardService.blockApp(processName.trim());
      toast(result.message, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function blockWebsiteNow(enabled: boolean) {
    if (!domain.trim()) {
      toast("请输入域名", "warning");
      return;
    }
    try {
      const result = await systemGuardService.setWebsiteBlock(domain.trim(), enabled);
      toast(result.message, enabled ? "success" : "info");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function checkUsbKeyNow() {
    try {
      const result = await systemGuardService.checkUsbKey();
      toast(result.message, result.success ? "success" : "warning");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function lockWhenBluetoothLeaves() {
    try {
      const result = await systemGuardService.lockIfBluetoothMissing();
      toast(result.message, "info");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Shield</p>
        <h1>安全防护</h1>
        <p className="hero-copy">输入锁定、应用限制、网站屏蔽和设备检测</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>输入锁定</h2>
        </div>
        <div className="settings-grid">
          <div className="form-stack">
            <strong style={{ fontSize: 13 }}>锁定时长</strong>
            <select value={lockDuration} onChange={(event) => setLockDuration(Number(event.currentTarget.value))}>
              {LOCK_DURATIONS.map((d) => (
                <option key={d} value={d}>{d} 秒</option>
              ))}
            </select>
            <button type="button" onClick={lockInputNow}>锁定系统输入</button>
            <p className="muted" style={{ fontSize: 12 }}>锁定期间键盘和鼠标输入将被禁用，到时自动恢复</p>
          </div>
          <div className="form-stack">
            <strong style={{ fontSize: 13 }}>设备检测</strong>
            <p className="muted" style={{ fontSize: 12 }}>检测 USB Key 或蓝牙设备状态，用于解锁验证</p>
            <div className="action-row">
              <button type="button" onClick={checkUsbKeyNow}>检测 USB Key</button>
              <button type="button" onClick={lockWhenBluetoothLeaves}>蓝牙离开锁屏</button>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <h2>应用与网站限制</h2>
        </div>
        <div className="settings-grid">
          <label className="form-stack">
            <strong style={{ fontSize: 13 }}>应用限制</strong>
            <input value={processName} onChange={(event) => setProcessName(event.currentTarget.value)} placeholder="例如 chrome.exe" />
            <button type="button" onClick={blockAppNow} disabled={!processName.trim()}>立即限制</button>
            <p className="muted" style={{ fontSize: 12 }}>终止指定进程，仅对正在运行的进程生效</p>
          </label>
          <label className="form-stack">
            <strong style={{ fontSize: 13 }}>网站限制</strong>
            <input value={domain} onChange={(event) => setDomain(event.currentTarget.value)} placeholder="例如 example.com" />
            <div className="action-row">
              <button type="button" onClick={() => blockWebsiteNow(true)} disabled={!domain.trim()}>启用限制</button>
              <button type="button" onClick={() => blockWebsiteNow(false)} disabled={!domain.trim()}>移除限制</button>
            </div>
            <p className="muted" style={{ fontSize: 12 }}>通过修改 hosts 文件屏蔽指定网站</p>
          </label>
        </div>
      </section>
    </>
  );
}
