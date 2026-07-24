"use client";

type Sfx = "click" | "buy" | "reward" | "request" | "card" | "symbol";

class IdleAudio {
  private ctx: AudioContext | null = null;
  private unlocked = false;
  private volume = 0.6;
  private muted = false;
  private enabled = true;

  configure(opts: { volume?: number; muted?: boolean; enabled?: boolean }) {
    if (opts.volume !== undefined) this.volume = opts.volume;
    if (opts.muted !== undefined) this.muted = opts.muted;
    if (opts.enabled !== undefined) this.enabled = opts.enabled;
  }

  async unlock() {
    if (this.unlocked || typeof window === "undefined") return;
    try {
      this.ctx = new AudioContext();
      await this.ctx.resume();
      this.unlocked = true;
    } catch {
      this.unlocked = false;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, gain: number) {
    if (!this.ctx || this.muted || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.value = gain * this.volume;
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.connect(g);
      g.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + dur);
    } catch {
      /* ignore */
    }
  }

  play(id: Sfx) {
    if (!this.unlocked) return;
    switch (id) {
      case "click":
        this.tone(420, 0.06, "sine", 0.04);
        break;
      case "buy":
        this.tone(280, 0.1, "triangle", 0.05);
        break;
      case "reward":
        this.tone(520, 0.18, "sine", 0.05);
        this.tone(780, 0.22, "sine", 0.03);
        break;
      case "request":
        this.tone(360, 0.12, "triangle", 0.04);
        break;
      case "card":
        this.tone(300, 0.15, "triangle", 0.05);
        break;
      case "symbol":
        this.tone(600, 0.25, "sine", 0.04);
        break;
    }
  }
}

export const idleAudio = new IdleAudio();
