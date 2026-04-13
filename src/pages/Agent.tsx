import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, Bot, User, ArrowLeft, Zap } from "lucide-react";
import { IS_DEMO } from "@/lib/demo-data";

interface Message {
  id: string;
  role: "user" | "agent";
  text: string;
  ts: Date;
}

const AGENT_ENDPOINT = import.meta.env.VITE_AGENT_URL ?? "";

const DEMO_RESPONSES: Record<string, string> = {
  default: "Hey! I'm the Corral agent. I'm not fully wired up yet — but when I am, I can help you find events, check who's going, suggest things based on your scene, or answer questions about Corral. What would you like to know?",
  event: "There are some great events coming up this week! A doof in the Yarra Valley on Friday, a queer club night on Saturday, and a free jazz session in Fitzroy Gardens on Sunday. Want details on any of them?",
  friend: "Jade K and Max L are both going to the Dusk til Dawn doof this Friday. Sadiya R is going to the Sunday jazz session. Want me to nudge anyone?",
  hello: "Hey! Good to hear from you. I can tell you what's on, who's going, or help you post an event. What do you need?",
  help: "I can: find events for you, tell you who's going, recommend things based on your vibe, help post a new event, or just chat about the scene. What do you want?",
};

function getDemoResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("event") || lower.includes("what's on") || lower.includes("whats on") || lower.includes("tonight") || lower.includes("weekend")) return DEMO_RESPONSES.event;
  if (lower.includes("friend") || lower.includes("who") || lower.includes("going")) return DEMO_RESPONSES.friend;
  if (lower.includes("hello") || lower.includes("hey") || lower.includes("hi") || lower.includes("hiya")) return DEMO_RESPONSES.hello;
  if (lower.includes("help") || lower.includes("what can")) return DEMO_RESPONSES.help;
  return DEMO_RESPONSES.default;
}

async function sendToAgent(message: string): Promise<string> {
  if (IS_DEMO || !AGENT_ENDPOINT) {
    await new Promise(r => setTimeout(r, 600 + Math.random() * 600)); // fake latency
    return getDemoResponse(message);
  }
  const res = await fetch(AGENT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Agent error ${res.status}`);
  const data = await res.json();
  return data.reply ?? data.message ?? "...";
}

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "agent",
      text: "Hey! I'm the Corral agent 👋\n\nI can help you find events, see what your friends are doing, or answer questions about what's on. What do you want to know?",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text, ts: new Date() };
    setMessages(m => [...m, userMsg]);
    setLoading(true);

    try {
      const reply = await sendToAgent(text);
      setMessages(m => [...m, { id: `a-${Date.now()}`, role: "agent", text: reply, ts: new Date() }]);
    } catch {
      setMessages(m => [...m, { id: `err-${Date.now()}`, role: "agent", text: "Something went wrong. Try again in a sec.", ts: new Date() }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "hsl(var(--background))" }}>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{ backgroundColor: "hsl(var(--card) / 0.9)", borderColor: "hsl(var(--border))" }}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <Link to="/" style={{ color: "hsl(var(--muted-foreground))" }}>
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}>
              <Bot size={16} style={{ color: "hsl(var(--primary))" }} />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none" style={{ color: "hsl(var(--foreground))" }}>Corral Agent</p>
              <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                {IS_DEMO ? "Demo mode" : "Online"}
              </p>
            </div>
          </div>
          {IS_DEMO && (
            <div className="ml-auto flex items-center gap-1 text-xs rounded-full px-2.5 py-1"
              style={{ backgroundColor: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
              <Zap size={11} />
              Demo
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-4 space-y-4 pb-32">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5"
              style={msg.role === "agent"
                ? { backgroundColor: "hsl(var(--primary) / 0.2)" }
                : { backgroundColor: "hsl(var(--secondary))" }
              }>
              {msg.role === "agent"
                ? <Bot size={14} style={{ color: "hsl(var(--primary))" }} />
                : <User size={14} style={{ color: "hsl(var(--muted-foreground))" }} />
              }
            </div>

            {/* Bubble */}
            <div className="max-w-[78%]">
              <div className="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={msg.role === "agent"
                  ? { backgroundColor: "hsl(var(--card))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }
                  : { backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }
                }>
                {msg.text}
              </div>
              <p className="text-xs mt-1 px-1"
                style={{ color: "hsl(var(--muted-foreground))", textAlign: msg.role === "user" ? "right" : "left" }}>
                {msg.ts.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}>
              <Bot size={14} style={{ color: "hsl(var(--primary))" }} />
            </div>
            <div className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
              style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              {[0, 1, 2].map(i => (
                <span key={i} className="h-1.5 w-1.5 rounded-full animate-bounce"
                  style={{ backgroundColor: "hsl(var(--muted-foreground))", animationDelay: `${i * 150}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {/* Quick prompts */}
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2">
        <div className="mx-auto max-w-2xl flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {["What's on this week?", "Who's going tonight?", "Free events?", "Doof near me?"].map(prompt => (
            <button key={prompt} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs whitespace-nowrap"
              style={{ backgroundColor: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))", border: "1px solid hsl(var(--border))" }}>
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 border-t px-4 py-3"
        style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <div className="mx-auto max-w-2xl flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask about events, friends, what's on..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
            className="flex-1 rounded-xl px-4 py-2.5 text-sm outline-none"
            style={{
              backgroundColor: "hsl(var(--secondary))",
              color: "hsl(var(--foreground))",
              border: "1px solid hsl(var(--border))",
            }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
