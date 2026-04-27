import { useState } from "react";
import { systemGuardService } from "../services";
import { useToast } from "../components/common";

export function ShieldPage() {
  const { toast } = useToast();
  const [inputGuard, setInputGuard] = useState("关闭");
  const [processName, setProcessName] = useState("chrome.exe");
  const [domain, setDomain] = useState("example.com");

  async function lockInputNow() {
    try {
      const result = await systemGuardService.lockInput(15);
      toast(result.message, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function blockAppNow() {
    try {
      const result = await systemGuardService.blockApp(processName);
      toast(result.message, "success");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function blockWebsiteNow(enabled: boolean) {
    try {
      const result = await systemGuardService.setWebsiteBlock(domain, enabled);
      toast(result.message, enabled ? "success" : "info");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function checkUsbKeyNow() {
    try {
      const result = await systemGuardService.checkUsbKey();
      toast(result.message, "info");
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
          <h2>输入控制</h2>
        </div>
        <div className="settings-grid">
          <label className="form-stack">
            <strong style={{ fontSize: 13 }}>键盘清洁模式</strong>
            <select value={inputGuard} onChange={(event) => setInputGuard(event.currentTarget.value)}>
              <option value="关闭">关闭</option>
              <option value="仅锁键盘">仅锁键盘</option>
              <option value="仅锁鼠标">仅锁鼠标</option>
              <option value="禁用快捷键">禁用特定快捷键</option>
            </select>
          </label>
          <div className="form-stack">
            <strong style={{ fontSize: 13 }}>系统增强</strong>
            <p className="muted" style={{ fontSize: 12 }}>输入锁定使用 Windows BlockInput，应用限制使用 taskkill，网站限制写入 hosts 标记段。</p>
            <div className="action-row">
              <button type="button" onClick={lockInputNow}>锁定输入 15s</button>
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
            <button type="button" onClick={blockAppNow}>立即限制</button>
          </label>
          <label className="form-stack">
            <strong style={{ fontSize: 13 }}>网站限制</strong>
            <input value={domain} onChange={(event) => setDomain(event.currentTarget.value)} placeholder="例如 example.com" />
            <div className="action-row">
              <button type="button" onClick={() => blockWebsiteNow(true)}>启用限制</button>
              <button type="button" onClick={() => blockWebsiteNow(false)}>移除限制</button>
            </div>
          </label>
        </div>
      </section>
    </>
  );
}
