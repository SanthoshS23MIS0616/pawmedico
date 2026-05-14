export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-sand px-4 py-3 text-sm font-medium text-ink">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-coral" />
      <span>{label}</span>
    </div>
  );
}
