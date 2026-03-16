import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { formatDateVN } from '@/components/admin/campaign-detail/campaignDetailUtils';

interface AnalyticsPoint {
  date: string;
  value: number;
}

interface AnalyticsLineChartProps {
  title: string;
  points: AnalyticsPoint[];
  valueFormatter?: (value: number) => string;
  yAxisLabel?: string;
  yAxisTickFormatter?: (value: number) => string;
  getTooltipRows?: (payload: { date: string; value: number }) => Array<{ label: string; value: string }>;
  yScaleMode?: 'linear' | 'auto-log';
  onPointSelect?: (payload: { date: string; value: number }) => void;
}

function formatShortDate(value: string): string {
  const parts = value.split('-');
  if (parts.length === 3) return `${parts[2]}-${parts[1]}`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

function toVNDayKey(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(date);
}

function extractPointFromChartEvent(event: unknown): {
  date: string;
  value: number;
} | null {
  if (!event || typeof event !== 'object') return null;

  const activePayload = (
    event as {
      activePayload?: Array<{ payload?: { date?: string; value?: number; rawValue?: number } }>;
    }
  ).activePayload;
  const payload = activePayload?.[0]?.payload;
  if (!payload?.date) return null;

  return {
    date: payload.date,
    value: Number(payload.rawValue ?? payload.value ?? 0),
  };
}

const chartConfig = {
  value: {
    label: 'Giá trị',
    color: '#f43f5e',
  },
} satisfies ChartConfig;

export function AnalyticsLineChart({
  title,
  points,
  valueFormatter = (v) => String(v),
  yAxisLabel,
  yAxisTickFormatter,
  getTooltipRows,
  yScaleMode = 'linear',
  onPointSelect,
}: AnalyticsLineChartProps) {
  const safePoints = points.map((point) => ({
    date: toVNDayKey(point.date),
    dateLabel: formatShortDate(toVNDayKey(point.date)),
    rawValue: Number.isFinite(point.value) ? Math.max(0, point.value) : 0,
  }));

  const maxValue = safePoints.reduce((max, point) => Math.max(max, point.rawValue), 0);
  const nonZeroMin = safePoints.reduce((min, point) => {
    if (point.rawValue <= 0) return min;
    if (min === 0) return point.rawValue;
    return Math.min(min, point.rawValue);
  }, 0);
  const valueGapRatio = nonZeroMin > 0 ? maxValue / nonZeroMin : 1;
  const useLogScale = yScaleMode === 'auto-log' && valueGapRatio >= 100;

  const normalizedPoints = safePoints.map((point) => ({
    ...point,
    value: useLogScale ? Math.max(1, point.rawValue) : point.rawValue,
  }));

  if (!normalizedPoints.length) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <p className="mb-2 text-sm font-semibold text-black">{title}</p>
        <p className="text-sm text-black/45">Chưa có dữ liệu biểu đồ.</p>
      </div>
    );
  }

  const latestMeaningfulPoint =
    [...normalizedPoints].reverse().find((point) => point.rawValue > 0) ??
    normalizedPoints[normalizedPoints.length - 1];
  const chartMinWidth = Math.max(640, normalizedPoints.length * 56);
  const tickFormatter = yAxisTickFormatter ?? valueFormatter;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-black/50">
          Hiện tại: {valueFormatter(latestMeaningfulPoint.rawValue)}
          {useLogScale ? ' • scale log' : ''}
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <ChartContainer
          config={chartConfig}
          className="h-[260px] aspect-auto [&_.recharts-wrapper:focus]:outline-none [&_.recharts-surface:focus]:outline-none"
          style={{ minWidth: `${chartMinWidth}px` }}
        >
          <AreaChart
            data={normalizedPoints}
            margin={{ top: 8, right: 12, left: 20, bottom: 8 }}
            onClick={(event) => {
              if (!onPointSelect) return;
              const point = extractPointFromChartEvent(event);
              if (!point) return;
              onPointSelect(point);
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis dataKey="dateLabel" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />

            <YAxis
              scale={useLogScale ? 'log' : 'auto'}
              domain={useLogScale ? [1, 'auto'] : ['auto', 'auto']}
              tickLine={false}
              axisLine={false}
              width={84}
              allowDecimals={false}
              tickFormatter={(value) => tickFormatter(Number(value))}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      style: { textAnchor: 'middle', fill: 'rgba(0,0,0,0.55)', fontSize: 11 },
                    }
                  : undefined
              }
            />

            <ReferenceLine y={0} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />

            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const point = payload[0]?.payload as { date?: string; rawValue?: number } | undefined;
                if (!point?.date) return null;

                const baseRows = getTooltipRows
                  ? getTooltipRows({ date: point.date, value: Number(point.rawValue ?? 0) })
                  : [{ label: 'Giá trị', value: valueFormatter(Number(point.rawValue ?? 0)) }];

                return (
                  <div className="pointer-events-none min-w-[220px] rounded-lg border border-black/10 bg-white px-3 py-2 shadow-xl">
                    <p className="text-xs font-semibold text-black/80 mb-2">Ngày {formatDateVN(point.date)}</p>
                    <div className="space-y-1.5">
                      {baseRows.map((row) => (
                        <div key={row.label} className="flex items-center justify-between gap-3 text-xs">
                          <span className="text-black/60">{row.label}</span>
                          <span className="font-semibold text-black">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />

            <Area
              dataKey="value"
              type="monotone"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 6, style: { cursor: onPointSelect ? 'pointer' : 'default' } }}
              dot={(props) => {
                const point = props.payload as { date?: string; value?: number; rawValue?: number };
                const date = point?.date;
                const value = Number(point?.value ?? 0);
                const rawValue = Number((props.payload as { rawValue?: number })?.rawValue ?? value);

                return (
                  <g>
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={4}
                      fill="var(--color-value)"
                      style={{ cursor: onPointSelect ? 'pointer' : 'default' }}
                    />
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={11}
                      fill="transparent"
                      style={{ cursor: onPointSelect ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (!onPointSelect || !date) return;
                        onPointSelect({ date, value: rawValue });
                      }}
                    />
                  </g>
                );
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
