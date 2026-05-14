export function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-xl rounded-[24px] px-4 py-3 text-sm shadow ${isUser ? "bg-ink text-white" : "bg-white text-ink"}`}>{text}</div>
    </div>
  );
}
