/**
 * Diagnosis (`?diag` in the address): a small panel lists what the 3D found on this device and how
 * its start went, so a problem seen on a phone can be told apart without a console.
 */
export const diagnosing = typeof location !== 'undefined' && new URLSearchParams(location.search).has('diag');

/** How the 3D start went: written by the scene as it happens, read by the panel. */
export const boot = {
  phase: 'attesa del codice 3D',
  /** Milliseconds from the page's start. */
  compileStart: Number.NaN,
  compileEnd: Number.NaN,
  ready: Number.NaN,
  /** True when the shaders took too long and the scene went on without waiting. */
  capped: false,
  gpu: '',
  webgl2: false,
  maps: 0,
  lost: 0,
  errors: [] as string[],
};

export function bootError(message: string) {
  if (boot.errors.length < 4) boot.errors.push(message.replace(/\s+/g, ' ').trim().slice(0, 180));
}

// From the very start, before the panel itself has loaded.
if (diagnosing) {
  window.addEventListener('error', (e) => bootError(e.message));
  window.addEventListener('unhandledrejection', (e) => bootError(String(e.reason)));
}
