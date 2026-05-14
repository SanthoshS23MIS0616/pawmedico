import { FormEvent, useState } from "react";

import { ChatBubble } from "../components/ChatBubble";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { api } from "../services/api";
import { AppLanguage, t } from "../utils/translations";

export function PawBotPage({ language: uiLanguage }: { language: AppLanguage }) {
  const copy = t(uiLanguage);
  const [message, setMessage] = useState("");
  const [language, setLanguage] = useState<"en" | "ta" | "hi">(uiLanguage);
  const [history, setHistory] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    const nextHistory = [...history, { role: "user" as const, text: message }];
    setHistory(nextHistory);
    setLoading(true);
    const currentMessage = message;
    setMessage("");
    try {
      setHistory([...nextHistory, { role: "assistant", text: "" }]);
      await api.chatStream(
        { message: currentMessage, language },
        {
          onChunk: (chunk) => {
            setHistory((current) => {
              const updated = [...current];
              const last = updated[updated.length - 1];
              if (!last || last.role !== "assistant") {
                updated.push({ role: "assistant", text: chunk });
              } else {
                last.text += chunk;
              }
              return updated;
            });
          },
          onError: async () => {
            const response = await api.chat({ message: currentMessage, language });
            setHistory([...nextHistory, { role: "assistant", text: response.reply }]);
          }
        }
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="panel p-8">
        <h1 className="text-3xl font-black">{copy.pawbotTitle}</h1>
        <p className="mt-3 text-sm text-ink/70 dark:text-paper/70">{copy.pawbotBody}</p>
        <div className="mt-6">
          <label className="label">Reply language</label>
          <select className="input" value={language} onChange={(event) => setLanguage(event.target.value as "en" | "ta" | "hi")}>
            <option value="en">English</option>
            <option value="ta">Tamil</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </section>

      <section className="panel flex min-h-[32rem] flex-col p-6">
        <div className="flex-1 space-y-4 overflow-y-auto rounded-[24px] bg-sand/50 p-4 dark:bg-white/5">
          {history.length ? history.map((item, index) => <ChatBubble key={index} role={item.role} text={item.text} />) : <p className="text-sm text-ink/60 dark:text-paper/60">Start with a symptom, diet, wound, vaccine, or emergency question.</p>}
          {loading ? <LoadingSpinner label="PawBot is thinking..." /> : null}
        </div>
        <form className="mt-4 flex flex-col gap-3 md:flex-row" onSubmit={submit}>
          <input className="input flex-1" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="My dog has vomiting and low energy for one day..." />
          <button className="button-primary" type="submit">
            Send
          </button>
        </form>
      </section>
    </div>
  );
}
