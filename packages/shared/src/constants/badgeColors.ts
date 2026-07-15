/** Soft tinted badge colours: light alpha bg + 700 text (no border — keeps row width compact). */
export const BADGE_COLOR_CLASSES = {
  purple: 'bg-violet-500/20 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300',
  violet: 'bg-violet-500/20 text-violet-700 dark:bg-violet-400/20 dark:text-violet-300',
  indigo: 'bg-indigo-500/20 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300',
  green: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300',
  emerald: 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300',
  teal: 'bg-teal-500/20 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300',
  amber: 'bg-amber-500/20 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300',
  orange: 'bg-orange-500/20 text-orange-700 dark:bg-orange-400/20 dark:text-orange-300',
  sky: 'bg-sky-500/20 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300',
  cyan: 'bg-cyan-500/20 text-cyan-700 dark:bg-cyan-400/20 dark:text-cyan-300',
  blue: 'bg-blue-500/20 text-blue-700 dark:bg-blue-400/20 dark:text-blue-300',
  rose: 'bg-rose-500/20 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300',
  fuchsia: 'bg-fuchsia-500/20 text-fuchsia-700 dark:bg-fuchsia-400/20 dark:text-fuchsia-300',
  slate: 'bg-slate-500/20 text-slate-700 dark:bg-slate-400/20 dark:text-slate-300',
  zinc: 'bg-zinc-500/20 text-zinc-700 dark:bg-zinc-400/20 dark:text-zinc-300',
} as const satisfies Record<string, string>;

export type BadgeColorName = keyof typeof BADGE_COLOR_CLASSES;

export function resolveBadgeClass(colorName: string): string {
  return (BADGE_COLOR_CLASSES as Record<string, string>)[colorName] ?? BADGE_COLOR_CLASSES.blue;
}
