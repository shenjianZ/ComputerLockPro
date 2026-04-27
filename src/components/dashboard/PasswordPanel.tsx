import { useState } from "react";
import type { PasswordStatus, SetupPasswordResult } from "../../types";

interface PasswordPanelProps {
  status: PasswordStatus | null;
  onSetup: (password: string) => Promise<SetupPasswordResult>;
  onChange: (oldPassword: string, newPassword: string) => Promise<string>;
  onReset: (recoveryCode: string, newPassword: string) => Promise<SetupPasswordResult>;
}

export function PasswordPanel({ status, onSetup, onChange, onReset }: PasswordPanelProps) {
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [message, setMessage] = useState("");
  const [issuedCode, setIssuedCode] = useState("");

  async function submitSetup() {
    const result = await onSetup(password);
    setIssuedCode(result.recoveryCode);
    setPassword("");
    setMessage("密码已设置，请保存恢复码。");
  }

  async function submitChange() {
    setMessage(await onChange(oldPassword, newPassword));
    setOldPassword("");
    setNewPassword("");
  }

  async function submitReset() {
    const result = await onReset(recoveryCode, newPassword);
    setIssuedCode(result.recoveryCode);
    setRecoveryCode("");
    setNewPassword("");
    setMessage("密码已重置，请保存新的恢复码。");
  }

  return (
    <section className="panel password-panel">
      <div className="panel-heading">
        <p className="eyebrow">密码管理</p>
        <h2>{status?.passwordSet ? "锁屏密码已启用" : "首次设置锁屏密码"}</h2>
        {status?.migrationRequired && <p className="warning-text">检测到默认密码，请立即修改。</p>}
      </div>
      {!status?.passwordSet ? (
        <div className="form-row">
          <input type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} placeholder="新密码，至少 8 位且包含多类字符" />
          <button type="button" onClick={submitSetup}>设置密码</button>
        </div>
      ) : (
        <div className="settings-grid">
          <div className="form-stack">
            <strong>修改密码</strong>
            <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.currentTarget.value)} placeholder="当前密码" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} placeholder="新密码" />
            <button type="button" onClick={submitChange}>修改密码</button>
          </div>
          <div className="form-stack">
            <strong>恢复码重置</strong>
            <input value={recoveryCode} onChange={(event) => setRecoveryCode(event.currentTarget.value)} placeholder="本地恢复码" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} placeholder="新密码" />
            <button type="button" onClick={submitReset}>重置密码</button>
          </div>
        </div>
      )}
      {issuedCode && <p className="recovery-code">恢复码：{issuedCode}</p>}
      {message && <p className="muted">{message}</p>}
    </section>
  );
}
