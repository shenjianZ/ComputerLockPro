export function FocusPage() {
  return (
    <>
      <section className="page-heading">
        <p className="eyebrow">Focus</p>
        <h1>专注模式</h1>
        <p className="hero-copy">
          番茄钟、强制休息、护眼提醒和应用限制会在下一阶段接入。
        </p>
      </section>
      <section className="panel feature-grid">
        <article>
          <strong>番茄钟</strong>
          <p className="muted">25 分钟专注与 5 分钟休息的基础节奏。</p>
        </article>
        <article>
          <strong>护眼提醒</strong>
          <p className="muted">预留 20-20-20 规则提醒入口。</p>
        </article>
        <article>
          <strong>强制休息</strong>
          <p className="muted">后续可联动锁屏窗口和系统通知。</p>
        </article>
      </section>
    </>
  );
}
