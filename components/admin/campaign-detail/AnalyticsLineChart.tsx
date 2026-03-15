import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

  const activePayload = (event as { activePayload?: Array<{ payload?: { date?: string; value?: number } }> })
    .activePayload;
  const payload = activePayload?.[0]?.payload;
  if (!payload?.date) return null;

  return {
    date: payload.date,
    value: Number(payload.value ?? 0),
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
  onPointSelect,
}: AnalyticsLineChartProps) {
  const normalizedPoints = points.map((point) => ({
    date: toVNDayKey(point.date),
    dateLabel: formatShortDate(toVNDayKey(point.date)),
    value: Number.isFinite(point.value) ? point.value : 0,
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
    [...normalizedPoints].reverse().find((point) => point.value > 0) ?? normalizedPoints[normalizedPoints.length - 1];
  const chartMinWidth = Math.max(640, normalizedPoints.length * 56);
  const tickFormatter = yAxisTickFormatter ?? valueFormatter;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-black/50">Hiện tại: {valueFormatter(latestMeaningfulPoint.value)}</p>
      </div>

      <div className="w-full overflow-x-auto">
        <ChartContainer
          config={chartConfig}
          className="h-[260px] aspect-auto [&_.recharts-wrapper:focus]:outline-none [&_.recharts-surface:focus]:outline-none"
          style={{ minWidth: `${chartMinWidth}px` }}
        >
          <AreaChart
            data={normalizedPoints}
            margin={{ top: 8, right: 12, left: 4, bottom: 8 }}
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
              tickLine={false}
              axisLine={false}
              width={70}
              allowDecimals={false}
              tickFormatter={(value) => tickFormatter(Number(value))}
              label={
                yAxisLabel
                  ? {
                      value: yAxisLabel,
                      angle: -90,
                      position: 'insideLeft',
                      offset: -2,
                      style: { textAnchor: 'middle', fill: 'rgba(0,0,0,0.55)', fontSize: 11 },
                    }
                  : undefined
              }
            />

            <ReferenceLine y={0} stroke="rgba(0,0,0,0.2)" strokeWidth={1} />

            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="pointer-events-none"
                  indicator="line"
                  labelFormatter={(_, payload) => {
                    const dateValue = payload?.[0]?.payload?.date as string | undefined;
                    return dateValue ? `Ngày ${formatShortDate(dateValue)}` : '';
                  }}
                  formatter={(value) => (
                    <span className="font-medium text-foreground">{valueFormatter(Number(value))}</span>
                  )}
                />
              }
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
                const point = props.payload as { date?: string; value?: number };
                const date = point?.date;
                const value = Number(point?.value ?? 0);

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
                        onPointSelect({ date, value });
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
