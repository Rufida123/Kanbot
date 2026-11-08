import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { buildBurndown } from '@/features/board/utils/burndown';
import { ChartSvg, CHART_HEIGHT, CHART_PADDING, useChartColors, useIsRtlChart, xForIndex, YAxis, yForValue } from '@/shared/components/ChartSvg';
import { formatDateOnly, getTodayDateOnly } from '@/shared/utils/formatDate';
import type { Sprint, Todo } from '@/shared/types/api';

type BurndownChartProps = { sprint: Sprint; todos: readonly Todo[]; today?: string };

/** Ideal vs actual remaining points, with a "today" marker. Empty and short sprints get a message. */
export function BurndownChart({ sprint, todos, today = getTodayDateOnly() }: BurndownChartProps) {
  const { t } = useTranslation();
  const colors = useChartColors();
  const isRtl = useIsRtlChart();
  const burndown = buildBurndown(sprint.startDate, sprint.endDate, todos, today);

  if (burndown === null || burndown === 'short') {
    return <Typography color="text.secondary">{burndown === 'short' ? t('board:burndown.short') : t('board:burndown.empty')}</Typography>;
  }
  const { days, total, todayIndex } = burndown;
  const count = days.length;
  const line = (values: (number | null)[]) =>
    values
      .map((value, index) => (value === null ? null : `${xForIndex(index, count, isRtl).toFixed(1)},${yForValue(value, total).toFixed(1)}`))
      .filter((point): point is string => point !== null)
      .join(' ');
  const last = [...days].reverse().find((day) => day.actual !== null)?.actual ?? total;
  const labelEvery = Math.max(1, Math.ceil(count / 6));

  return (
    <Box>
      <ChartSvg label={t('board:burndown.aria', { remaining: last, total })}>
        <YAxis max={total} isRtl={isRtl} />
        <polyline points={line(days.map((day) => day.ideal))} fill="none" strokeWidth={2} strokeDasharray="6 4" style={{ stroke: colors.text }} />
        <polyline points={line(days.map((day) => day.actual))} fill="none" strokeWidth={3} strokeLinejoin="round" style={{ stroke: colors.primary }} />
        {days.map((day, index) => day.actual === null ? null : <circle key={day.date} cx={xForIndex(index, count, isRtl)} cy={yForValue(day.actual, total)} r={3.5} style={{ fill: colors.primary }} />)}
        {todayIndex === null ? null : (
          <g>
            <line x1={xForIndex(todayIndex, count, isRtl)} x2={xForIndex(todayIndex, count, isRtl)} y1={CHART_PADDING.top} y2={CHART_HEIGHT - CHART_PADDING.bottom} strokeWidth={1.5} strokeDasharray="3 3" style={{ stroke: colors.warning }} />
            <text x={xForIndex(todayIndex, count, isRtl)} y={CHART_PADDING.top - 4} textAnchor="middle" fontSize={11} style={{ fill: colors.warning }}>{t('board:burndown.today')}</text>
          </g>
        )}
        {days.map((day, index) => index % labelEvery === 0 || index === count - 1 ? (
          <text key={day.date} x={xForIndex(index, count, isRtl)} y={CHART_HEIGHT - 14} textAnchor="middle" fontSize={11} style={{ fill: colors.text }}>{formatDateOnly(day.date).replace(/,?\s*\d{4}/, '')}</text>
        ) : null)}
      </ChartSvg>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Box aria-hidden="true" component="span" sx={{ width: 18, borderTop: '2px dashed', borderColor: 'text.secondary' }} />{t('board:burndown.ideal')}</Box>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Box aria-hidden="true" component="span" sx={{ width: 18, borderTop: '3px solid', borderColor: 'primary.main' }} />{t('board:burndown.actual')}</Box>
      </Box>
    </Box>
  );
}
