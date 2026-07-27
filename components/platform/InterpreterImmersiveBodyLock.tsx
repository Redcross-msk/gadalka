"use client";

import { useEffect } from "react";

/** На телефоне толкователь: без скролла всей страницы, только лента сообщений. */
export function InterpreterImmersiveBodyLock() {
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      const on = mq.matches;
      document.documentElement.classList.toggle("interpreter-chat-immersive", on);
      document.body.classList.toggle("interpreter-chat-immersive", on);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      document.documentElement.classList.remove("interpreter-chat-immersive");
      document.body.classList.remove("interpreter-chat-immersive");
    };
  }, []);

  return null;
}
