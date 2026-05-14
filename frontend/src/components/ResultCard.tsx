import type { ReactNode } from "react";

type ResultCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
};

export function ResultCard({ title, subtitle, badge, children }: ResultCardProps) {
  return (
    <section className="panel p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black">{title}</h3>
          {subtitle ? <p className="mt-2 text-sm text-ink/65 dark:text-paper/70">{subtitle}</p> : null}
        </div>
        {badge ? <span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-coral">{badge}</span> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
