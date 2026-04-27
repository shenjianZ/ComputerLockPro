import { useEffect, useState } from "react";
import { useToast } from "../components/common";

export function FocusPage() {
  const { toast } = useToast();
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [eyeReminder, setEyeReminder] = useState(true);
  const [standReminder, setStandReminder] = useState(true);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => {
        const next = Math.max(0, value - 1);
        if (next === 0) {
          setRunning(false);
          toast("番茄钟结束，休息一下吧！", "success");
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, toast]);

  const minutes = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const seconds = (secondsLeft % 60).toString().padStart(2, "0");

  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Focus</p>
        <h1>专注模式</h1>
        <p className="hero-copy">番茄钟、护眼提醒和久坐提醒</p>
      </section>

      <section className="panel feature-grid">
        <article>
          <strong style={{ fontSize: 14 }}>番茄钟</strong>
          <p className="timer-text">{minutes}:{seconds}</p>
          <div className="action-row">
            <button type="button" onClick={() => setRunning((v) => !v)}>
              {running ? "暂停" : "开始"}
            </button>
            <button type="button" onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }}>
              重置
            </button>
          </div>
        </article>
        <article>
          <strong style={{ fontSize: 14 }}>护眼提醒</strong>
          <p className="muted" style={{ fontSize: 13 }}>20-20-20 规则：{eyeReminder ? "已启用" : "已关闭"}</p>
          <button type="button" onClick={() => {
            setEyeReminder((v) => !v);
            toast(eyeReminder ? "护眼提醒已关闭" : "护眼提醒已启用", "info");
          }}>
            {eyeReminder ? "关闭" : "启用"}
          </button>
        </article>
        <article>
          <strong style={{ fontSize: 14 }}>久坐提醒</strong>
          <p className="muted" style={{ fontSize: 13 }}>定时提醒起身活动：{standReminder ? "已启用" : "已关闭"}</p>
          <button type="button" onClick={() => {
            setStandReminder((v) => !v);
            toast(standReminder ? "久坐提醒已关闭" : "久坐提醒已启用", "info");
          }}>
            {standReminder ? "关闭" : "启用"}
          </button>
        </article>
      </section>
    </>
  );
}
