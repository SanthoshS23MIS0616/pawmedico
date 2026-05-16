import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { WeightLog } from "../services/api";

export function WeightChart({ logs }: { logs: WeightLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-ink/60">Add weight logs to see trend data.</p>;
  }

  const sorted = [...logs]
    .sort((a, b) => a.recorded_date.localeCompare(b.recorded_date))
    .map((item) => ({
      id: item.id,
      date: item.recorded_date,
      weight: item.weight_kg
    }));

  return (
    <div className="h-72 rounded-[24px] bg-sand/60 p-4 dark:bg-white/5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sorted}>
          <defs>
            <linearGradient id="pawmedicWeight" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#e76f51" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#e76f51" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(15, 23, 42, 0.12)" strokeDasharray="3 3" />
          <XAxis dataKey="date" fontSize={12} tickMargin={10} />
          <YAxis fontSize={12} tickFormatter={(value) => `${value} kg`} width={64} />
          <Tooltip formatter={(value) => [`${value ?? 0} kg`, "Weight"]} />
          <Area type="monotone" dataKey="weight" stroke="#e76f51" strokeWidth={3} fill="url(#pawmedicWeight)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
