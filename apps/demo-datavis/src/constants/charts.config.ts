import type { CSSProperties } from 'react';
import type { XAxisTickContentProps, YAxisTickContentProps } from 'recharts';
import type { TickProp } from 'recharts/types/util/types';

export const CHART_AXIS_LABEL_TEXT_STYLE: CSSProperties = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
};

export const CHART_AXIS_TICK_PROPS_SM: TickProp<XAxisTickContentProps | YAxisTickContentProps> = {
  fontSize: 11,
  fill: 'var(--muted-foreground)',
};

export const CHART_AXIS_TICK_PROPS_MD: TickProp<XAxisTickContentProps | YAxisTickContentProps> = {
  fontSize: 12,
  fill: 'var(--muted-foreground)',
};

export const TOOLTIP_STYLE: CSSProperties = {
  backgroundColor: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  fontSize: 13,
};

export const LEGEND_STYLE: CSSProperties = {
  fontSize: 13,
  paddingBottom: 8,
};

export const CHART_GRID_STROKE = 'var(--border)';
export const CHART_GRID_DASH = '3 3';

/** Entrance animation for static mock charts; live charts should use `isAnimationActive={false}`. */
export const CHART_ENTRANCE_ANIMATION = {
  isAnimationActive: 'auto' as const,
  animationDuration: 800,
  animationEasing: 'ease-out' as const,
};

type ChartAxisLabelPosition = 'insideLeft' | 'insideRight' | 'insideBottom' | 'insideBottomRight';

interface ChartAxisLabelOptions {
  value: string;
  angle?: number;
  position: ChartAxisLabelPosition;
  offset?: number;
}

export function chartAxisLabel({ value, angle = 0, position, offset = 0 }: ChartAxisLabelOptions) {
  return {
    value,
    angle,
    position,
    offset,
    style: CHART_AXIS_LABEL_TEXT_STYLE,
  };
}

export function chartYAxisLabelLeft(value: string, offset = 12) {
  return chartAxisLabel({ value, angle: -90, position: 'insideLeft', offset });
}

export function chartYAxisLabelRight(value: string, offset = 8) {
  return chartAxisLabel({ value, angle: 90, position: 'insideRight', offset });
}

export function chartXAxisLabelBottom(value: string, offset = -12) {
  return chartAxisLabel({ value, position: 'insideBottom', offset });
}

export function chartXAxisLabelBottomRight(value: string, offset = -8) {
  return chartAxisLabel({ value, position: 'insideBottomRight', offset });
}
