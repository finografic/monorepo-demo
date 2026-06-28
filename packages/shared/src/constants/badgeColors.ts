export const BADGE_COLOR_CLASSES = {
  purple: 'bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  green: 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  amber: 'bg-amber-200 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  orange: 'bg-orange-200 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  sky: 'bg-sky-200 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  teal: 'bg-teal-200 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200',
  rose: 'bg-rose-200 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
} as const satisfies Record<string, string>;

export type BadgeColorName = keyof typeof BADGE_COLOR_CLASSES;

export function resolveBadgeClass(colorName: string): string {
  return (BADGE_COLOR_CLASSES as Record<string, string>)[colorName] ?? BADGE_COLOR_CLASSES.blue;
}
