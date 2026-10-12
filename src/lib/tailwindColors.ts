/** The Tailwind colours used by the data gradients, as hex, for the 3D materials. */
const HEX: Record<string, string> = {
  'violet-500': '#8b5cf6',
  'purple-600': '#9333ea',
  'cyan-500': '#06b6d4',
  'blue-600': '#2563eb',
  'emerald-500': '#10b981',
  'green-600': '#16a34a',
  'orange-500': '#f97316',
  'amber-500': '#f59e0b',
  'amber-600': '#d97706',
  'pink-500': '#ec4899',
  'rose-600': '#e11d48',
  'teal-500': '#14b8a6',
  'sky-400': '#38bdf8',
};

/** "from-sky-400 to-cyan-500" → ['#38bdf8', '#06b6d4']. */
export function gradientColors(classes: string): [string, string] {
  const from = classes.match(/from-([a-z]+-\d+)/)?.[1];
  const to = classes.match(/to-([a-z]+-\d+)/)?.[1];
  return [HEX[from ?? ''] ?? '#7c6cff', HEX[to ?? ''] ?? '#4da3ff'];
}
