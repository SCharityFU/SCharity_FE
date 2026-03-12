interface AnalyticsPoint {
  date: string;
  value: number;
}

interface AnalyticsLineChartProps {
  title: string;
  points: AnalyticsPoint[];
  valueFormatter?: (value: number) => string;
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export function AnalyticsLineChart({
  title,
  points,
  valueFormatter = (v) => String(v),
}: AnalyticsLineChartProps) {
  const width = 640;
  const height = 240;
  const padding = 24;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  if (!points.length) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4">
        <p className="text-sm font-semibold text-black mb-2">{title}</p>
        <p className="text-sm text-black/45">Chưa có dữ liệu biểu đồ.</p>
      </div>
    );
  }

  const maxValue = Math.max(...points.map((p) => p.value), 1);
  const minValue = Math.min(...points.map((p) => p.value), 0);
  const valueRange = Math.max(1, maxValue - minValue);

  const pathPoints = points.map((point, index) => {
    const x = padding + (index / Math.max(1, points.length - 1)) * innerWidth;
    const y = padding + ((maxValue - point.value) / valueRange) * innerHeight;
    return { x, y, point };
  });

  const pathD = pathPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  const lastPoint = points[points.length - 1];

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="mb-3 flex items-end justify-between gap-2">
        <p className="text-sm font-semibold text-black">{title}</p>
        <p className="text-xs text-black/50">Hiện tại: {valueFormatter(lastPoint.value)}</p>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="min-w-[640px] w-full h-auto">
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="rgba(0,0,0,0.1)"
          />
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="rgba(0,0,0,0.1)"
          />

          <path d={pathD} fill="none" stroke="#f43f5e" strokeWidth="2.5" />

          {pathPoints.map((p, index) => (
            <circle key={`${p.point.date}-${index}`} cx={p.x} cy={p.y} r="3" fill="#f43f5e" />
          ))}

          {pathPoints.map((p, index) => {
            if (index % Math.ceil(points.length / 6) !== 0 && index !== points.length - 1) return null;
            return (
              <text
                key={`label-${p.point.date}-${index}`}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                fontSize="10"
                fill="rgba(0,0,0,0.45)"
              >
                {formatShortDate(p.point.date)}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
