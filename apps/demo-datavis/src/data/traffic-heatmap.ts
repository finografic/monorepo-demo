import type { HeatmapCell } from './types';

const DAYS = 7;
const HOURS = 24;

const weekdayProfile: number[] = [
  120, 95, 72, 58, 62, 148, 420, 680, 850, 640, 490, 510, 520, 530, 560, 680, 820, 890, 710, 540, 390, 280,
  195, 148,
];

const weekendProfile: number[] = [
  98, 78, 62, 51, 48, 62, 120, 210, 340, 490, 580, 620, 630, 610, 590, 560, 510, 480, 430, 370, 290, 210, 155,
  118,
];

const profiles: Record<number, number[]> = {
  0: weekdayProfile,
  1: weekdayProfile,
  2: weekdayProfile,
  3: weekdayProfile,
  4: [
    125, 98, 74, 60, 64, 152, 425, 690, 840, 650, 495, 515, 525, 540, 565, 695, 840, 910, 740, 570, 420, 310,
    225, 168,
  ],
  5: weekendProfile,
  6: [
    88, 68, 54, 44, 41, 55, 105, 185, 310, 430, 510, 545, 550, 530, 505, 480, 440, 405, 365, 310, 245, 178,
    132, 100,
  ],
};

export const HEATMAP_DATA: HeatmapCell[] = [];

for (let day = 0; day < DAYS; day++) {
  const profile = profiles[day] ?? weekdayProfile;
  for (let hour = 0; hour < HOURS; hour++) {
    HEATMAP_DATA.push({ day, hour, volume: profile[hour] ?? 0 });
  }
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`,
);
