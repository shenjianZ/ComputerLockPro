import { useState } from "react";
import type { PasswordActionResult, PasswordStatus, SetupPasswordResult } from "../../types";

interface PasswordPanelProps {
  status: PasswordStatus | null;
  onSetup: (password: string) => Promise<SetupPasswordResult>;
  onChange: (oldPassword: string, newPassword: string) => Promise<PasswordActionResult>;
  onReset: (recoveryCode: string, newPassword: string) => Promise<SetupPasswordResult>;
  onToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
}

function getStrength(pwd: string): { label: string; color: string; score: number } {
  if (!pwd) return { label: "", color: "transparent", score: 0 };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "极弱", color: "#ef4444" },
    1: { label: "弱", color: "#f97316" },
    2: { label: "一般", color: "#eab308" },
    3: { label: "较强", color: "#22c55e" },
    4: { label: "强", color: "#16a34a" },
    5: { label: "极强", color: "#15803d" },
  };
  const s = map[score] ?? map[0];
  return { label: s.label, color: s.color, score };
}

export function PasswordPanel({ status, onSetup, onChange, onReset, onToast }: PasswordPanelProps) {
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [issuedCode, setIssuedCode] = useState("");

  const strength = getStrength(newPassword || password);
  const canSubmit = (newPassword || password).length >= 8 && strength.score >= 3;

  async function submitSetup() {
    if (password.length < 8) {
      onToast("密码至少需要 8 位", "warning");
      return;
    }
    if (strength.score < 3) {
      onToast("密码强度不足，请包含大写、小写、数字或符号中的至少 3 类", "warning");
      return;
    }
    try {
      const result = await onSetup(password);
      setIssuedCode(result.recoveryCode);
      setPassword("");
      onToast("密码已设置，请保存恢复码", "success");
    } catch (e) {
      onToast(String(e), "error");
    }
  }

  async function submitChange() {
    if (!oldPassword) {
      onToast("请输入当前密码", "warning");
      return;
    }
    if (newPassword.length < 8 || getStrength(newPassword).score < 3) {
      onToast("新密码强度不足", "warning");
      return;
    }
    try {
      const result = await onChange(oldPassword, newPassword);
      if (!result.success) {
        onToast(result.message, "error");
        return;
      }
      setOldPassword("");
      setNewPassword("");
      onToast(result.message, "success");
    } catch (e) {
      onToast(String(e), "error");
    }
  }

  async function submitReset() {
    if (!recoveryCode) {
      onToast("请输入恢复码", "warning");
      return;
    }
    if (newPassword.length < 8 || getStrength(newPassword).score < 3) {
      onToast("新密码强度不足", "warning");
      return;
    }
    try {
      const result = await onReset(recoveryCode, newPassword);
      setIssuedCode(result.recoveryCode);
      setRecoveryCode("");
      setNewPassword("");
      onToast("密码已重置，请保存新的恢复码", "success");
    } catch (e) {
      onToast(String(e), "error");
    }
  }

  const pwdForStrength = newPassword || password;

  return (
    <section className="panel">
      <div className="panel-heading">
        <p className="eyebrow">密码管理</p>
        <h2>{status?.passwordSet ? "锁屏密码已启用" : "首次设置锁屏密码"}</h2>
        {status?.migrationRequired && <p className="warning-text">检测到默认密码，请立即修改。</p>}
      </div>
      {!status?.passwordSet ? (
        <div className="form-stack">
          <input type="password" value={password} onChange={(event) => setPassword(event.currentTarget.value)} placeholder="新密码，至少 8 位且包含多类字符" />
          {pwdForStrength && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e4e0ef" }}>
                <div style={{ height: "100%", borderRadius: 2, background: strength.color, width: `${(strength.score / 5) * 100}%`, transition: "width 0.2s" }} />
              </div>
              <span style={{ color: strength.color }}>{strength.label}</span>
            </div>
          )}
          <button type="button" onClick={submitSetup} disabled={!canSubmit}>设置密码</button>
        </div>
      ) : (
        <div className="settings-grid">
          <div className="form-stack">
            <strong style={{ fontSize: 13 }}>修改密码</strong>
            <input type="password" value={oldPassword} onChange={(event) => setOldPassword(event.currentTarget.value)} placeholder="当前密码" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} placeholder="新密码" />
            {newPassword && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ flex: 1, height: 4, borderRadius: 2, background: "#e4e0ef" }}>
                  <div style={{ height: "100%", borderRadius: 2, background: strength.color, width: `${(strength.score / 5) * 100}%`, transition: "width 0.2s" }} />
                </div>
                <span style={{ color: strength.color }}>{strength.label}</span>
              </div>
            )}
            <button type="button" onClick={submitChange} disabled={!newPassword || strength.score < 3}>修改密码</button>
          </div>
          <div className="form-stack">
            <strong style={{ fontSize: 13 }}>恢复码重置</strong>
            <input value={recoveryCode} onChange={(event) => setRecoveryCode(event.currentTarget.value)} placeholder="本地恢复码" />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.currentTarget.value)} placeholder="新密码" />
            <button type="button" onClick={submitReset} disabled={!recoveryCode || !newPassword}>重置密码</button>
          </div>
        </div>
      )}
      {issuedCode && <p className="recovery-code">恢复码：{issuedCode}</p>}
    </section>
  );
}
