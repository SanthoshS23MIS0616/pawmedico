export function severityTone(severity: string) {
  if (severity.toLowerCase() === "high") return "bg-red-100 text-red-700";
  if (severity.toLowerCase() === "moderate") return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

export function splitSymptoms(text: string): string[] {
  return text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
