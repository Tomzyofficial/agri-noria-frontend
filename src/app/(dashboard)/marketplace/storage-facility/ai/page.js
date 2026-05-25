"use client";
import { useState, useEffect, useRef } from "react";

export default function AIAdvisorPage({ loans = ["dollar", "naira"] }) {
   const [messages, setMessages] = useState([
      {
         role: "ai",
         text: `Welcome to AgriFinance AI Advisor! 🌾\n\nI'm your intelligent agricultural financing assistant, powered by Claude. I can help you:\n\n• Analyze your loan portfolio and repayment trends\n• Assess credit risk for new applicants\n• Provide crop-specific financing recommendations\n• Identify farmers at risk of default\n• Offer market insights for agricultural commodities\n\nWhat would you like to explore today?`,
         time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
   ]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const bottomRef = useRef(null);

   useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages]);

   const portfolioContext = `
You are an AI advisor for AgriFinance, a Nigerian agricultural lending platform.
Current portfolio data:
- Total loans: ${loans?.length}
- Active loans: ${loans.filter((l) => l.status === "active").length}
- Total disbursed: ₦${loans.reduce((s, l) => s + l.disbursed, 0).toLocaleString()}
- Total repaid: ₦${loans.reduce((s, l) => s + l.repaid, 0).toLocaleString()}
- Crops financed: ${[...new Set(loans.map((l) => l.crop))].join(", ")}
- States: ${[...new Set(loans.map((l) => l.location))].join(", ")}
Loan details: ${JSON.stringify(loans.map((l) => ({ id: l.id, farmer: l.farmer, crop: l.crop, amount: l.amount, disbursed: l.disbursed, repaid: l.repaid, status: l.status, location: l.location })))}
Be concise, professional, and use Nigerian agricultural context. Format nicely with bullet points when helpful.
  `;

   const send = async () => {
      if (!input.trim() || loading) return;
      const userMsg = {
         role: "user",
         text: input.trim(),
         time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((p) => [...p, userMsg]);
      setInput("");
      setLoading(true);

      try {
         const history = messages.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text }));
         history.push({ role: "user", content: input.trim() });

         const res = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
               model: "claude-sonnet-4-20250514",
               max_tokens: 1000,
               system: portfolioContext,
               messages: history,
            }),
         });
         const data = await res.json();
         const text = data.content?.map((b) => b.text || "").join("") || "Sorry, I couldn't generate a response.";
         setMessages((p) => [
            ...p,
            { role: "ai", text, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
         ]);
      } catch (e) {
         setMessages((p) => [
            ...p,
            {
               role: "ai",
               text: "Connection error. Please check your network and try again.",
               time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
         ]);
      } finally {
         setLoading(false);
      }
   };

   const quickPrompts = [
      "Summarize my portfolio performance",
      "Which loans are at highest risk of default?",
      "What crops should I prioritize financing?",
      "Tips for improving repayment rates",
   ];

   return (
      <div className="chat-container">
         <div className="chat-messages">
            {messages.map((m, i) => (
               <div
                  key={i}
                  style={{
                     display: "flex",
                     flexDirection: "column",
                     alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  }}
               >
                  {m.role === "ai" && (
                     <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div
                           style={{
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "linear-gradient(135deg,var(--wheat),var(--harvest))",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 12,
                           }}
                        >
                           🌾
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)" }}>AI Advisor</span>
                     </div>
                  )}
                  <div className={`chat-bubble ${m.role}`} style={{ whiteSpace: "pre-wrap" }}>
                     {m.text}
                  </div>
                  <div className="chat-meta">{m.time}</div>
               </div>
            ))}
            {loading && (
               <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                     <div
                        style={{
                           width: 24,
                           height: 24,
                           borderRadius: "50%",
                           background: "linear-gradient(135deg,var(--wheat),var(--harvest))",
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                           fontSize: 12,
                        }}
                     >
                        🌾
                     </div>
                     <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-soft)" }}>AI Advisor</span>
                  </div>
                  <div className="chat-bubble ai">
                     <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                     </div>
                  </div>
               </div>
            )}
            <div ref={bottomRef}></div>
         </div>

         {messages.length <= 1 && (
            <div style={{ padding: "0 24px 12px", display: "flex", gap: 8, flexWrap: "wrap" }}>
               {quickPrompts.map((q) => (
                  <button key={q} className="btn btn-ghost btn-sm" onClick={() => setInput(q)}>
                     {q}
                  </button>
               ))}
            </div>
         )}

         <div className="chat-input-row">
            <textarea
               className="chat-input"
               value={input}
               rows={1}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                     e.preventDefault();
                     send();
                  }
               }}
               placeholder="Ask about your portfolio, risk assessment, crop outlook…"
            />
            <button className="chat-send-btn" onClick={send} disabled={loading || !input.trim()}>
               {loading ? <div className="spinner"></div> : "↑"}
            </button>
         </div>
      </div>
   );
}
