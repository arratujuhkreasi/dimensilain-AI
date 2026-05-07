"use client";

import { useMemo, useSyncExternalStore, useEffect } from "react";

interface TypewriterTextProps {
  content: string;
  speed?: number;
}

function createTickStore(speed: number) {
  let tick = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let targetLength = 0;
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((l) => l());
  }

  function scheduleNext() {
    if (tick >= targetLength) return;
    timer = setTimeout(() => {
      tick++;
      notify();
      scheduleNext();
    }, speed);
  }

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && timer) {
          clearTimeout(timer);
          timer = null;
        }
      };
    },
    getSnapshot() {
      return tick;
    },
    setTarget(len: number) {
      targetLength = len;
      if (len > tick + 50) {
        tick = len;
        if (timer) { clearTimeout(timer); timer = null; }
        notify();
      } else if (!timer && tick < len) {
        scheduleNext();
      }
    },
    destroy() {
      if (timer) { clearTimeout(timer); timer = null; }
      listeners.clear();
    },
  };
}

export function TypewriterText({ content, speed = 20 }: TypewriterTextProps) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const store = useMemo(() => createTickStore(speed), []);

  const tick = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

  useEffect(() => {
    store.setTarget(content.length);
  }, [store, content.length]);

  useEffect(() => {
    return () => store.destroy();
  }, [store]);

  const charIndex = Math.min(tick, content.length);
  const displayed = content.slice(0, charIndex);
  const isComplete = charIndex >= content.length;

  return (
    <div className="font-screenplay whitespace-pre-wrap text-sm leading-relaxed">
      {displayed}
      {!isComplete && (
        <span className="inline-block w-2 h-4 bg-blood animate-pulse ml-0.5" />
      )}
    </div>
  );
}
