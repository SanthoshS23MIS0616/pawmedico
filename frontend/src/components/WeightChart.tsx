import type { WeightLog } from "../services/api";

export function WeightChart({ logs }: { logs: WeightLog[] }) {
  if (!logs.length) {
    return <p className="text-sm text-ink/60">Add weight logs to see trend data.</p>;
  }

  const sorted = [...logs].sort((a, b) => a.recorded_date.localeCompare(b.recorded_date));
  const maxWeight = Math.max(...sorted.map((item) => item.weight_kg));

  return (
    <div className="space-y-3">
      {sorted.map((item) => (
        <div key={item.id}>
          <div className="mb-1 flex justify-between text-xs font-semibold text-ink/70">
            <span>{item.recorded_date}</span>
            <span>{item.weight_kg} kg</span>
          </div>
          <div className="h-3 rounded-full bg-sand">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-mint to-coral"
              style={{ width: `${Math.max(10, (item.weight_kg / maxWeight) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
