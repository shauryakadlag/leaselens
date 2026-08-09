"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Loader2, Bot, User, HelpCircle, ShieldCheck } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface AskMyLeaseProps {
  leaseText: string;
  fileName: string;
}

const SUGGESTED_QUESTIONS = [
  "What is my monthly rent and due date?",
  "What are the pet rules and fees?",
  "How much notice is required to move out?",
  "Who pays for electricity and water?",
  "Are there penalties for breaking the lease early?",
];

export default function AskMyLease({ leaseText, fileName }: AskMyLeaseProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Complete state reset whenever a new lease document is loaded
  useEffect(() => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "ai",
        text: `Hello! I am your **Ask My Lease** legal document assistant. Ask me any question about your uploaded lease agreement (*${fileName}*). Every answer is strictly extracted from your contract text.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setInputQuery("");
  }, [fileName, leaseText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendQuestion = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ask-lease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          leaseText,
          fileName,
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: data.answer || "I could not find an answer in your lease agreement.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      console.error("Ask My Lease error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ai",
          text: "An error occurred while analyzing your question. Please try asking again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(inputQuery);
    }
  };

  const renderFormattedText = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      const formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-[#1E1517]">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <p
          key={idx}
          className={`${line.startsWith(">") ? "italic border-l-2 border-[#5D0D18] pl-3 my-1 text-[#2F4C43] font-mono text-[11px]" : "mb-1.5"}`}
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="bg-[#FFFDF7] border border-[#EADFCF] rounded-xl shadow-sm overflow-hidden flex flex-col h-[540px]">
      {/* Header */}
      <div className="bg-[#F5ECCF] px-4 py-3 border-b border-[#E2D5B7] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5D0D18]/10 border border-[#5D0D18]/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#5D0D18]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1E1517] flex items-center gap-1.5">
              Ask My Lease <Sparkles className="w-3.5 h-3.5 text-[#5D0D18]" />
            </h3>
            <p className="text-[11px] text-[#544B4C]">Document-grounded legal assistant</p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#2F4C43] font-medium bg-[#EFF4F2] border border-[#C3D2CD] px-2.5 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3 text-[#2F4C43]" /> Strict Source Grounding
        </span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#FFFDF7]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-[#5D0D18] text-[#FFF9EB]"
                  : "bg-[#EFF4F2] text-[#2F4C43] border border-[#C3D2CD]"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[78%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-[#5D0D18] text-[#FFF9EB] rounded-tr-none shadow-sm"
                  : "bg-[#EFF4F2] border border-[#C3D2CD] text-[#1E1517] rounded-tl-none"
              }`}
            >
              {renderFormattedText(msg.text)}
              <span className={`block text-[10px] mt-1.5 ${msg.sender === "user" ? "text-[#E5B8BC] text-right" : "text-[#7A6F70]"}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-md bg-[#EFF4F2] text-[#2F4C43] border border-[#C3D2CD] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#EFF4F2] border border-[#C3D2CD] p-3 rounded-xl rounded-tl-none flex items-center gap-2 text-xs text-[#544B4C]">
              <Loader2 className="w-4 h-4 text-[#5D0D18] animate-spin" />
              <span>Analyzing lease agreement text...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Chips Bar */}
      <div className="px-4 py-2.5 bg-[#FAF4E6] border-t border-[#EADFCF] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <HelpCircle className="w-3.5 h-3.5 text-[#5D0D18] shrink-0" />
        <span className="text-[10px] font-semibold text-[#544B4C] uppercase tracking-wider shrink-0">Suggested:</span>
        {SUGGESTED_QUESTIONS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => sendQuestion(chip)}
            className="px-3 py-1 rounded-md bg-[#FFFDF7] hover:bg-[#EFF4F2] border border-[#C3D2CD] text-[11px] text-[#2F4C43] font-medium transition-colors shrink-0 disabled:opacity-50 shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(inputQuery);
        }}
        className="p-3 bg-[#F5ECCF] border-t border-[#E2D5B7] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your lease agreement (e.g. rent due date, pet policy, notice period)..."
          disabled={isLoading}
          className="flex-1 bg-[#FFFDF7] border border-[#E2D5B7] rounded-lg px-3.5 py-2 text-xs text-[#1E1517] placeholder-[#807576] focus:outline-none focus:border-[#5D0D18] transition-colors"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="p-2 rounded-lg bg-[#5D0D18] hover:bg-[#470912] disabled:bg-[#C8BDAB] disabled:text-[#807576] text-[#FFF9EB] transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
