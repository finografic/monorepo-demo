/** Soft tinted badge colours: very light alpha bg + soft border + 700 text. */
export const BADGE_COLOR_CLASSES = {
  purple:
    'border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-300',
  violet:
    'border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:border-violet-400/25 dark:bg-violet-400/10 dark:text-violet-300',
  indigo:
    'border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:border-indigo-400/25 dark:bg-indigo-400/10 dark:text-indigo-300',
  green:
    'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300',
  emerald:
    'border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/25 dark:bg-emerald-400/10 dark:text-emerald-300',
  teal: 'border border-teal-500/20 bg-teal-500/10 text-teal-700 dark:border-teal-400/25 dark:bg-teal-400/10 dark:text-teal-300',
  amber:
    'border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-300',
  orange:
    'border border-orange-500/20 bg-orange-500/10 text-orange-700 dark:border-orange-400/25 dark:bg-orange-400/10 dark:text-orange-300',
  sky: 'border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300',
  cyan: 'border border-cyan-500/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-300',
  blue: 'border border-blue-500/20 bg-blue-500/10 text-blue-700 dark:border-blue-400/25 dark:bg-blue-400/10 dark:text-blue-300',
  rose: 'border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:border-rose-400/25 dark:bg-rose-400/10 dark:text-rose-300',
  fuchsia:
    'border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-700 dark:border-fuchsia-400/25 dark:bg-fuchsia-400/10 dark:text-fuchsia-300',
  slate:
    'border border-slate-500/20 bg-slate-500/10 text-slate-700 dark:border-slate-400/25 dark:bg-slate-400/10 dark:text-slate-300',
  zinc: 'border border-zinc-500/20 bg-zinc-500/10 text-zinc-700 dark:border-zinc-400/25 dark:bg-zinc-400/10 dark:text-zinc-300',
} as const satisfies Record<string, string>;

export type BadgeColorName = keyof typeof BADGE_COLOR_CLASSES;

export function resolveBadgeClass(colorName: string): string {
  return (BADGE_COLOR_CLASSES as Record<string, string>)[colorName] ?? BADGE_COLOR_CLASSES.blue;
}
