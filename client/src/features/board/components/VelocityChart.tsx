import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { buildVelocity } from '@/features/board/utils/velocity';
import { ChartSvg, CHART_HEIGHT, CHART_PADDING, CHART_WIDTH, useChartColors, useIsRtlChart, xForIndex, YAxis, yForValue } from '@/shared/components/ChartSvg';
import type { Sprint } from '@/shared/types/api';
import { formatNumber } from '@/shared/utils/formatDate';

/** Committed vs completed points per completed sprint, with an average line (enhancement 12). */
export function VelocityChart({ sprints }: { sprints: readonly Sprint[] }) {
  const { t } = useTranslation();
  const colors = useChartColors();
  const isRtl = useIsRtlChart();
  const { points, average } = buildVelocity(sprints);
  if (points.length === 0) return <Typography color="text.secondary">{t('board:velocity.empty')}</Typography>;
  const max = Math.max(5, ...points.flatMap((point) => [point.committed, point.completed]));
  const inner = CHART_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const slot = inner / points.length;
  const barWidth = Math.min(28, slot / 3);
  const centerOf = (index: number) => xForIndex(index, points.length, isRtl) + (points.length === 1 ? 0 : 0);
  const averageY = yForValue(average, max);

  return (
    <Box>
      <ChartSvg label={t('board:velocity.aria', { count: points.length, value: average })}>
        <YAxis max={max} isRtl={isRtl} />
        {points.map((point, index) => {
          const center = points.length === 1 ? CHART_PADDING.left + inner / 2 : centerOf(index);
          return (
            <g key={point.id}>
              <rect x={center - barWidth - 1} y={yForValue(point.committed, max)} width={barWidth} height={CHART_HEIGHT - CHART_PADDING.bottom - yForValue(point.committed, max)} rx={3} style={{ fill: colors.grid }} />
              <rect x={center + 1} y={yForValue(point.completed, max)} width={barWidth} height={CHART_HEIGHT - CHART_PADDING.bottom - yForValue(point.completed, max)} rx={3} style={{ fill: colors.success }} />
              <text x={center + 1 + barWidth / 2} y={yForValue(point.completed, max) - 4} textAnchor="middle" fontSize={11} style={{ fill: colors.text }}>{formatNumber(point.completed)}</text>
              <text x={center} y={CHART_HEIGHT - 14} textAnchor="middle" fontSize={11} style={{ fill: colors.text }}>{point.name.length > 12 ? `${point.name.slice(0, 11)}…` : point.name}</text>
            </g>
          );
        })}
        <line x1={CHART_PADDING.left} x2={CHART_WIDTH - CHART_PADDING.right} y1={averageY} y2={averageY} strokeWidth={2} strokeDasharray="6 4" style={{ stroke: colors.primary }} />
      </ChartSvg>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Box aria-hidden="true" component="span" sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: 'divider' }} />{t('board:velocity.committed')}</Box>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Box aria-hidden="true" component="span" sx={{ width: 12, height: 12, borderRadius: 0.5, backgroundColor: 'success.main' }} />{t('board:velocity.completed')}</Box>
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}><Box aria-hidden="true" component="span" sx={{ width: 18, borderTop: '2px dashed', borderColor: 'primary.main' }} />{t('board:velocity.average', { value: formatNumber(average) })}</Box>
      </Box>
    </Box>
  );
}
