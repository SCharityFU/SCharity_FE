import { StatCounter } from "@/components/ui/number-counter";
import { HighlightText } from "@/components/ui/highlight-text";

export function StatsSection() {
  return (
    <section id="stats" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tác Động{" "}
            <HighlightText variant="underline" color="primary" className="text-black">
              Thực Tế
            </HighlightText>
          </h2>
          <p className="text-black/50">Những con số nói lên tất cả</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 1250, suffix: "+", label: "Chiến Dịch Thành Công" },
            { value: 52000, suffix: "+", label: "Nhà Hảo Tâm" },
            { value: 18, suffix: " tỷ ₫", label: "Đã Gây Quỹ" },
            { value: 63, suffix: " tỉnh", label: "Phủ Sóng Toàn Quốc" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card rounded-2xl p-8 text-center hover:-translate-y-1 transition-transform"
            >
              <StatCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                className="text-black"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
