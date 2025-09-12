let locked = false;
let unlockTimer: ReturnType<typeof setTimeout> | null = null;

export function isNavLocked() {
  return locked;
}

export function lockNav(durationMs = 1000) {
  if (unlockTimer) {
    clearTimeout(unlockTimer);
    unlockTimer = null;
  }
  locked = true;
  unlockTimer = setTimeout(() => {
    locked = false;
    unlockTimer = null;
  }, durationMs);
}

export function forceUnlockNav() {
  if (unlockTimer) {
    clearTimeout(unlockTimer);
    unlockTimer = null;
  }
  locked = false;
}

