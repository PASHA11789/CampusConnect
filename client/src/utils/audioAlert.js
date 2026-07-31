// Web Audio API Sound Synthesizer & Vibration Manager for Rider Arrival Alerts

let audioCtx = null;
let alertIntervalId = null;

/**
 * Initializes or resumes the Web Audio API AudioContext.
 */
function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Global event listeners to ensure AudioContext unlocks on any user gesture
if (typeof window !== "undefined") {
  const unlock = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  };
  ["click", "touchstart", "keydown", "mousedown", "pointerdown"].forEach((evt) => {
    window.addEventListener(evt, unlock, { passive: true });
  });
}

/**
 * Plays a loud, clear multi-tone bell ring sequence for 5 seconds.
 */
export function playArrivalBell(durationSec = 5) {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      // Play 5 distinct bell strokes at t = 0s, 1s, 2s, 3s, 4s
      for (let i = 0; i < durationSec; i++) {
        const strokeTime = now + i * 1.0;

        // Primary Bell Tone (A5 - 880Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, strokeTime);
        gain1.gain.setValueAtTime(0.5, strokeTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, strokeTime + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(strokeTime);
        osc1.stop(strokeTime + 0.8);

        // High Harmonic Tone (E6 - 1320Hz)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(1320, strokeTime + 0.1);
        gain2.gain.setValueAtTime(0.4, strokeTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, strokeTime + 0.9);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(strokeTime + 0.1);
        osc2.stop(strokeTime + 0.9);

        // Resonant Chime (A6 - 1760Hz)
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = "sine";
        osc3.frequency.setValueAtTime(1760, strokeTime + 0.2);
        gain3.gain.setValueAtTime(0.35, strokeTime + 0.2);
        gain3.gain.exponentialRampToValueAtTime(0.001, strokeTime + 0.95);
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(strokeTime + 0.2);
        osc3.stop(strokeTime + 0.95);
      }
    }
  } catch (err) {
    console.warn("Audio bell playback error:", err);
  }
}

/**
 * Triggers hardware vibration pattern on supported mobile devices for 5 seconds.
 */
export function triggerVibration(durationSec = 5) {
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const pattern = [];
      const pulses = Math.floor((durationSec * 1000) / 600);
      for (let i = 0; i < pulses; i++) {
        pattern.push(400, 200);
      }
      navigator.vibrate(pattern);
    }
  } catch (err) {
    console.warn("Vibration error:", err);
  }
}

/**
 * Plays a 5-second arrival alert (Bell sound + Device vibration for 5 seconds).
 */
export function triggerArrivalAlert() {
  playArrivalBell(5);
  triggerVibration(5);
}

/**
 * Starts continuous, un-muteable alert loop:
 * Rings bell & vibrates for 5 seconds, pauses for 8 seconds, then rings again automatically.
 */
export function startArrivalAlertLoop(ringDurationMs = 5000, pauseMs = 8000) {
  stopArrivalAlertLoop();

  // Play first 5-second alert immediately
  triggerArrivalAlert();

  const totalCycleMs = ringDurationMs + pauseMs; // 13000ms

  alertIntervalId = setInterval(() => {
    triggerArrivalAlert();
  }, totalCycleMs);
}

/**
 * Stops the recurring arrival alert loop (called ONLY when order is delivered / completed).
 */
export function stopArrivalAlertLoop() {
  if (alertIntervalId) {
    clearInterval(alertIntervalId);
    alertIntervalId = null;
  }
  try {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(0);
    }
  } catch (_) {}
}
