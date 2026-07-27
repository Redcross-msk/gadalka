"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Send, Lock, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { sendMessage, generateSessionTitle, interpreterModes, premiumFeatures } from "@/services/interpreter";
import type { ChatSession, InterpreterMode } from "@/types";
import { LEGAL_DISCLAIMER } from "@/lib/utils";

const quickPrompts: Record<InterpreterMode, string[]> = {
  dream: ["Я видел сон про дверь...", "Повторяющийся сон о воде", "Странный сон с зеркалом"],
  spread: ["Объясни мой расклад из трёх карт", "Что означает эта комбинация?", "Интерпретация позиций"],
  symbol: ["Что означает ключ?", "Увидел зеркало — что это?", "Знак: птица у окна"],
  question: ["Как спросить про отношения?", "Помоги сформулировать вопрос", "Вопрос про работу"],
  tarot: ["Расскажи про карту Луна", "Значение Шута", "Что означает Башня?"],
};

function MessagesScroll({
  children,
  scrollKey,
  className,
}: {
  children: React.ReactNode;
  scrollKey: string | number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const prevVv = useRef(0);

  const scrollToBottom = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useLayoutEffect(() => {
    scrollToBottom();
  }, [scrollKey, scrollToBottom]);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    prevVv.current = vv.height;
    const onResize = () => {
      const h = vv.height;
      if (prevVv.current > 0 && h > prevVv.current + 72) {
        requestAnimationFrame(() => requestAnimationFrame(scrollToBottom));
      }
      prevVv.current = h;
    };
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, [scrollToBottom]);

  return (
    <div
      ref={ref}
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-y-contain touch-pan-y", className)}
    >
      {children}
    </div>
  );
}

function ChatMessageList({
  mode,
  activeSession,
  loading,
  onPickPrompt,
}: {
  mode: InterpreterMode;
  activeSession?: ChatSession;
  loading: boolean;
  onPickPrompt: (prompt: string) => void;
}) {
  return (
    <div className="flex min-h-full flex-col space-y-3">
      {!activeSession || activeSession.messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center px-2 py-8">
          <p className="font-serif text-lg sm:text-xl text-gold mb-1.5">Толкователь</p>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm leading-relaxed">
            Задайте вопрос или выберите подсказку. Ответы носят развлекательный характер.
          </p>
          <div className="flex flex-col gap-2 mt-5 w-full max-w-md">
            {quickPrompts[mode].map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onPickPrompt(prompt)}
                className="w-full px-3 py-2.5 rounded-xl border border-border/70 text-xs text-left text-cream/80 active:border-gold/40 touch-manipulation"
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
  );
}

function ChatComposer({
  input,
  setInput,
  loading,
  isPremium,
  onSend,
  showDisclaimer,
}: {
  input: string;
  setInput: (v: string) => void;
  loading: boolean;
  isPremium: boolean;
  onSend: () => void;
  showDisclaimer?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="hidden sm:flex flex-wrap gap-1">
        {premiumFeatures.slice(0, 3).map((f) => (
          <Badge key={f} variant={isPremium ? "free" : "outline"} className="text-[10px]">
            {!isPremium && <Lock className="h-2.5 w-2.5 mr-1" />}
            {isPremium ? `${f} · доступно` : f}
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
              onSend();
            }
          }}
        />
        <Button
          onClick={onSend}
          disabled={loading || !input.trim()}
          aria-label="Отправить"
          className="h-11 w-11 shrink-0 touch-manipulation"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {showDisclaimer && (
        <p className="text-[10px] text-muted-foreground/70">{LEGAL_DISCLAIMER}</p>
      )}
    </div>
  );
}

export function AIChatWindow() {
  const [mode, setMode] = useState<InterpreterMode>("dream");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);

  const isPremium = useAppStore((s) => s.isPremium);
  const chatSessions = useAppStore((s) => s.chatSessions);
  const createChatSession = useAppStore((s) => s.createChatSession);
  const addChatMessage = useAppStore((s) => s.addChatMessage);

  const activeSession = chatSessions.find((s) => s.id === activeSessionId);
  const modeSessions = chatSessions.filter((s) => s.mode === mode);
  const scrollKey = `${activeSessionId ?? "new"}-${activeSession?.messages.length ?? 0}-${loading ? 1 : 0}`;

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
    <>
      {/* Mobile: оболочка между «назад» и нижним меню — как в МОСКАСТИНГ */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 z-40 flex flex-col overflow-hidden",
          "border-y border-border/40 bg-[#2e282c]",
          "top-[calc(env(safe-area-inset-top)+3.1rem)]",
          "bottom-[calc(3.85rem+env(safe-area-inset-bottom))]"
        )}
      >
        <div className="shrink-0 border-b border-border/60 px-2.5 pt-2 pb-2 bg-[#2e282c]">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
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

        <MessagesScroll scrollKey={`m-${scrollKey}`} className="px-3 py-3">
          <ChatMessageList
            mode={mode}
            activeSession={activeSession}
            loading={loading}
            onPickPrompt={setInput}
          />
        </MessagesScroll>

        <div className="shrink-0 border-t border-border/70 bg-[#2a242a] px-3 pt-2.5 pb-2.5">
          <ChatComposer
            input={input}
            setInput={setInput}
            loading={loading}
            isPremium={isPremium}
            onSend={() => void handleSend()}
          />
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex flex-row gap-6 h-[calc(100vh-200px)] min-h-[500px]">
        <div className="w-64 shrink-0 space-y-4">
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
                {modeSessions.length === 0 && (
                  <p className="text-[11px] text-muted-foreground px-1">История сохранится здесь</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-lg border border-gold/20 bg-burgundy/10">
              <Lock className="h-4 w-4 text-gold mb-2" />
              <p className="text-xs text-muted-foreground">Память диалогов — премиум</p>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden rounded-xl border border-border/80 bg-card/30">
          <MessagesScroll scrollKey={`d-${scrollKey}`} className="px-4 py-4">
            <ChatMessageList
              mode={mode}
              activeSession={activeSession}
              loading={loading}
              onPickPrompt={setInput}
            />
          </MessagesScroll>
          <div className="shrink-0 border-t border-border/70 bg-[#2e282c]/80 backdrop-blur-md p-4">
            <ChatComposer
              input={input}
              setInput={setInput}
              loading={loading}
              isPremium={isPremium}
              onSend={() => void handleSend()}
              showDisclaimer
            />
          </div>
        </div>
      </div>
    </>
  );
}
