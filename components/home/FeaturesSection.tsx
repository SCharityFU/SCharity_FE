import { Shield, Zap, Globe, BarChart3, Users } from 'lucide-react';
import { BentoGrid } from '@/components/ui/bento-grid';
import { HighlightText } from '@/components/ui/highlight-text';

const bentoFeatures = [
  {
    icon: Shield,
    title: 'Minh Bạch 100%',
    description: 'Mọi giao dịch được ghi nhận và công khai. Bạn biết rõ tiền đi đâu.',
    className: 'md:col-span-2',
    gradient: 'from-rose-500/20 to-pink-500/10',
  },
  {
    icon: Zap,
    title: 'Thanh Toán Tức Thì',
    description: 'Chuyển tiền ngay lập tức qua QR.',
    className: '',
    gradient: 'from-amber-500/20 to-orange-500/10',
  },
  {
    icon: Globe,
    title: 'Phủ Sóng Toàn Quốc',
    description: 'Kết nối các chiến dịch từ 63 tỉnh thành trên cả Việt Nam.',
    className: '',
    gradient: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    icon: BarChart3,
    title: 'Phân Tích Thời Gian Thực',
    description: 'Dashboard chi tiết giúp nhà sáng lập theo dõi tiến độ và báo cáo minh bạch.',
    className: '',
    gradient: 'from-violet-500/20 to-purple-500/10',
  },
  {
    icon: Users,
    title: 'Cộng Đồng Mạnh Mẽ',
    description: 'Hơn 50,000 nhà hảo tâm đang cùng nhau tạo nên những điều kỳ diệu.',
    className: '',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Tại Sao Chọn{' '}
            <HighlightText variant="circle" color="secondary" className="gradient-text">
              FCam?
            </HighlightText>
          </h2>
          <p className="text-black/50 max-w-xl mx-auto">
            Chúng tôi xây dựng nền tảng với sứ mệnh tối cao: mỗi đồng quyên góp đều tạo ra tác động thực sự.
          </p>
        </div>
        <BentoGrid>
          {bentoFeatures.map((feature) => (
            <div
              key={feature.title}
              className={`glass-card rounded-2xl p-6 overflow-hidden relative group hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br ${feature.gradient} ${feature.className}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-black/5 to-transparent" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold text-black mb-2">{feature.title}</h3>
                <p className="text-black/60 text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
