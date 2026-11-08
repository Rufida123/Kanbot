import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getDirection } from '@/shared/i18n';

export const CHART_WIDTH = 640;
export const CHART_HEIGHT = 280;
export const CHART_PADDING = { top: 16, right: 16, bottom: 36, left: 44 } as const;

/** Colours as CSS variables, so charts follow light/dark without re-rendering. */
export function useChartColors() {
  const theme = useTheme();
  const palette = theme.vars?.palette ?? theme.palette;
  return { text: palette.text.secondary, grid: palette.divider, primary: palette.primary.main, success: palette.success.main, warning: palette.warning.main };
}

/** True in Arabic: charts mirror, so time runs in the reading direction (right to left). */
export function useIsRtlChart(): boolean {
  const { i18n } = useTranslation();
  return getDirection(i18n.language) === 'rtl';
}

type ChartSvgProps = { label: string; children: ReactNode };

/** A responsive SVG frame with an accessible name. Text inside uses `dir="auto"` per element. */
export function ChartSvg({ label, children }: ChartSvgProps) {
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} width="100%" style={{ display: 'block', maxHeight: '22rem' }} direction="ltr">
      {children}
    </svg>
  );
}

/** Horizontal grid lines + y-axis labels. */
export function YAxis({ max, isRtl, ticks = 4 }: { max: number; isRtl: boolean; ticks?: number }) {
  const colors = useChartColors();
  const inner = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  return (
    <g>
      {Array.from({ length: ticks + 1 }, (_, index) => {
        const value = (max / ticks) * index;
        const y = CHART_HEIGHT - CHART_PADDING.bottom - (inner / ticks) * index;
        const labelX = isRtl ? CHART_WIDTH - CHART_PADDING.right + 6 : CHART_PADDING.left - 6;
        return (
          <g key={index}>
            <line x1={CHART_PADDING.left} x2={CHART_WIDTH - CHART_PADDING.right} y1={y} y2={y} style={{ stroke: colors.grid }} strokeWidth={1} />
            <text x={labelX} y={y + 4} textAnchor={isRtl ? 'start' : 'end'} fontSize={11} style={{ fill: colors.text }}>
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** x for the i-th of n points, mirrored in RTL. */
export function xForIndex(index: number, count: number, isRtl: boolean): number {
  const inner = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const ratio = count <= 1 ? 0.5 : index / (count - 1);
  const offset = (isRtl ? 1 - ratio : ratio) * inner;
  return CHART_PADDING.left + offset;
}

export function yForValue(value: number, max: number): number {
  const inner = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  return CHART_HEIGHT - CHART_PADDING.bottom - (max === 0 ? 0 : (value / max) * inner);
}
