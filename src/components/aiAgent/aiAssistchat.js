import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { profile, experience, projects, privateWork, skills, education } from "../../data/profile";

// Answers visitor questions from the portfolio data, entirely in the browser.
// No API keys ship to the client — anything placed in a CRA bundle is public.

const suggestions = ["What's your experience?", "Show me projects", "Tech stack?", "How can I contact you?"];

const intents = [
  {
    keys: ["experience", "work", "job", "kupos", "company", "career", "octanet"],
    answer: () =>
      experience
        .map((j) => `• ${j.role} at ${j.company} (${j.period})\n  ${j.points[0]}`)
        .join("\n\n"),
  },
  {
    keys: ["project", "built", "portfolio", "app", "parkpass", "billing", "demo", "private", "repo", "code"],
    answer: () =>
      "Here are some highlights:\n\n" +
      projects.map((p) => `• ${p.title} — ${p.kind} (${p.stack.join(", ")})`).join("\n") +
      "\n\nAt work (private repos):\n" +
      privateWork.map((p) => `• ${p.title}`).join("\n") +
      "\n\nScroll to the Projects section for links and live demos.",
  },
  {
    keys: ["skill", "stack", "tech", "react", "native", "know", "language", "tools"],
    answer: () => skills.map((g) => `• ${g.group}: ${g.items.join(", ")}`).join("\n"),
  },
  {
    keys: ["contact", "email", "hire", "reach", "phone", "call", "linkedin", "available"],
    answer: () =>
      `${profile.shortName} is open to work. Here's how to get in touch:\n\n📧 ${profile.email}\n📞 ${profile.phone}\n💼 linkedin.com/in/aayash-ahmad-185036242`,
  },
  {
    keys: ["education", "degree", "study", "mca", "bca", "university", "college", "certif"],
    answer: () => education.map((e) => `• ${e.title} — ${e.place}`).join("\n"),
  },
  {
    keys: ["where", "location", "based", "from", "live", "remote"],
    answer: () => `${profile.shortName} is based in ${profile.location}. Reach out via the Contact section to talk about role location.`,
  },
  {
    keys: ["cv", "resume"],
    answer: () => "You can download the CV with the “Download CV” button at the top of the page, or the Resume button in the nav.",
  },
  {
    keys: ["hi", "hello", "hey", "salam", "who"],
    answer: () => `Hi! 👋 ${profile.name} is a ${profile.role}. Ask me about experience, projects, skills, or how to get in touch.`,
  },
];

function reply(question) {
  const q = question.toLowerCase();
  const match = intents.find((i) => i.keys.some((k) => q.includes(k)));
  return match
    ? match.answer()
    : `I can tell you about ${profile.shortName}'s experience, projects, skills, education, or contact details — try one of the suggestions below.`;
}

export default function AIAssistChat({ onClose }) {
  const [messages, setMessages] = useState([
    { from: "ai", text: `Hi! I'm ${profile.shortName}'s assistant. What would you like to know?` },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = (text) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "ai", text: reply(q) }]);
      setTyping(false);
    }, 550);
  };

  return (
    <motion.div
      className="chat"
      role="dialog"
      aria-label="Portfolio assistant"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.96 }}
      transition={{ duration: 0.25 }}
    >
      <div className="chat__head">
        <img src={profile.photo} alt="" />
        <div>
          <strong>Ask about {profile.shortName}</strong>
          <span><span className="status__dot" /> Answers from my CV</span>
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close chat">
          <i className="fas fa-xmark" />
        </button>
      </div>

      <div className="chat__body">
        {messages.map((m, i) => (
          <div key={i} className={`bubble bubble--${m.from}`}>{m.text}</div>
        ))}
        {typing && (
          <div className="bubble bubble--ai bubble--typing">
            <span /><span /><span />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="chat__chips">
        {suggestions.map((s) => (
          <button key={s} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <form
        className="chat__input"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a question…"
          aria-label="Your question"
        />
        <button className="btn btn--primary btn--icon" disabled={!input.trim() || typing} aria-label="Send">
          <i className="fas fa-paper-plane" />
        </button>
      </form>
    </motion.div>
  );
}
