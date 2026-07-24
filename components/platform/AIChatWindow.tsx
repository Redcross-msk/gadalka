"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { sendMessage, generateSessionTitle, interpreterModes, premiumFeatures } from "@/services/interpreter";
import type { InterpreterMode } from "@/types";
import { LEGAL_DISCLAIMER } from "@/lib/utils";

const quickPrompts: Record<InterpreterMode, string[]> = {
  dream: ["Я видел сон про дверь...", "Повторяющийся сон о воде", "Странный сон с зеркалом"],
  spread: ["Объясни мой расклад из трёх карт", "Что означает эта комбинация?", "Интерпретация позиций"],
  symbol: ["Что означает ключ?", "Увидел зеркало — что это?", "Знак: птица у окна"],
  question: ["Как спросить про отношения?", "Помоги сформулировать вопрос", "Вопрос про работу"],
  tarot: ["Расскажи про карту Луна", "Значение Шута", "Что означает Башня?"],
};

export function AIChatWindow() {
  const [mode, setMode] = useState<InterpreterMode>("dream");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isPremium = useAppStore((s) => s.isPremium);
  const chatSessions = useAppStore((s) => s.chatSessions);
  const createChatSession = useAppStore((s) => s.createChatSession);
  const addChatMessage = useAppStore((s) => s.addChatMessage);

  const activeSession = chatSessions.find((s) => s.id === activeSessionId);
  const modeSessions = chatSessions.filter((s) => s.mode === mode);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeSession?.messages.length, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createChatSession(mode, generateSessionTitle(mode, input));
      setActiveSessionId(sessionId);
    }

    const userMessage = input.trim();
    setInput("");
    addChatMessage(sessionId, "user", userMessage);
    setLoading(true);

    try {
      const response = await sendMessage(mode, userMessage);
      addChatMessage(sessionId, "assistant", response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 lg:h-[calc(100vh-200px)] lg:min-h-[500px]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block lg:w-64 shrink-0 space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-2">Режим</p>
          <div className="flex flex-col gap-1">
            {interpreterModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setActiveSessionId(null);
                }}
                className={cn(
                  "text-left px-3 py-2 rounded-lg text-sm transition-colors min-h-[44px]",
                  mode === m.id
                    ? "bg-burgundy/20 text-gold border border-gold/20"
                    : "hover:bg-secondary text-muted-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {isPremium ? (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Диалоги</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {modeSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSessionId(s.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs truncate transition-colors",
                    activeSessionId === s.id
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg border border-gold/20 bg-burgundy/10">
            <Lock className="h-4 w-4 text-gold mb-2" />
            <p className="text-xs text-muted-foreground">Память диалогов — премиум</p>
          </div>
        )}
      </div>

      {/* Chat shell */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 overflow-hidden",
          "rounded-xl border border-border/80 bg-card/30",
          /* Мобилка: фиксированная высота под навбар + клавиатуру */
          "h-[min(72dvh,560px)] sm:h-[min(70dvh,640px)] lg:h-auto"
        )}
      >
        {/* Mobile mode chips */}
        <div className="lg:hidden shrink-0 border-b border-border/60 px-2 pt-2 pb-2">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {interpreterModes.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setMode(m.id);
                  setActiveSessionId(null);
                }}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] tracking-wide touch-manipulation min-h-[36px]",
                  mode === m.id
                    ? "border-gold/45 bg-gold/10 text-gold"
                    : "border-border/50 text-muted-foreground"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
          {isPremium && modeSessions.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSessions((v) => !v)}
              className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gold/70 touch-manipulation"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              {showSessions ? "Скрыть диалоги" : "Диалоги"}
            </button>
          )}
          {showSessions && isPremium && (
            <div className="mt-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
              {modeSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setActiveSessionId(s.id);
                    setShowSessions(false);
                  }}
                  className={cn(
                    "shrink-0 max-w-[140px] truncate rounded-lg border px-2.5 py-1.5 text-[10px]",
                    activeSessionId === s.id
                      ? "border-gold/40 bg-gold/10 text-gold"
                      : "border-border/50 text-muted-foreground"
                  )}
                >
                  {s.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:p-4 space-y-3">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full text-center px-2 py-6">
              <p className="font-serif text-lg sm:text-xl text-gold mb-1.5">Толкователь</p>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
                Задайте вопрос или выберите подсказку. Ответы носят развлекательный характер.
              </p>
              <div className="flex flex-col sm:flex-wrap sm:flex-row gap-2 mt-5 w-full sm:w-auto sm:justify-center max-w-md">
                {quickPrompts[mode].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="w-full sm:w-auto px-3 py-2.5 rounded-xl border border-border/70 text-xs text-left sm:text-center text-cream/80 active:border-gold/40 touch-manipulation"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeSession.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "max-w-[88%] sm:max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "ml-auto bg-burgundy/20 border border-burgundy/30"
                    : "bg-secondary/50 border border-border"
                )}
              >
                {msg.content}
              </div>
            ))
          )}
          {loading && (
            <div className="bg-secondary/50 rounded-2xl px-3.5 py-2.5 text-sm text-muted-foreground animate-pulse max-w-[80%]">
              Толкователь размышляет...
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="shrink-0 border-t border-border/70 bg-[#2e282c]/80 backdrop-blur-md px-3 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4 space-y-2">
          <div className="hidden sm:flex flex-wrap gap-1">
            {premiumFeatures.slice(0, 3).map((f) => (
              <Badge key={f} variant="outline" className="text-[10px]">
                {!isPremium && <Lock className="h-2.5 w-2.5 mr-1" />}
                {f}
              </Badge>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Задайте вопрос..."
              rows={1}
              className="min-h-[44px] max-h-28 resize-none text-sm flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Отправить"
              className="h-11 w-11 shrink-0 touch-manipulation"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/70 line-clamp-1 sm:line-clamp-none">
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  );
}
