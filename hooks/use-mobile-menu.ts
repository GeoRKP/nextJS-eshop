"use client";

import { useSyncExternalStore } from "react";

let isOpen = false;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export const mobileMenuStore = {
  open() {
    if (isOpen) return;
    isOpen = true;
    notify();
  },
  close() {
    if (!isOpen) return;
    isOpen = false;
    notify();
  },
  set(value: boolean) {
    if (isOpen === value) return;
    isOpen = value;
    notify();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot() {
    return isOpen;
  },
};

export function useMobileMenuOpen(): boolean {
  return useSyncExternalStore(
    mobileMenuStore.subscribe,
    mobileMenuStore.getSnapshot,
    () => false
  );
}
