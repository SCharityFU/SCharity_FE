'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { RainbowButton } from '@/components/ui/rainbow-button';
import { MorphingText } from '@/components/ui/text-morphing';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { useGetActiveUserCountQuery } from '@/lib/store/features/home/homeApi';
import { NumberCounter } from '@/components/ui/number-counter';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function HeroSection() {
  const { data: userCount = 50000, isLoading } = useGetActiveUserCountQuery();

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-pattern pt-16 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scrapbook side photos */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden xl:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto absolute left-5 top-24 w-[320px] rotate-[-8deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-3 left-10 h-6 w-24 rotate-[-7deg] rounded-sm border border-amber-200/70 bg-amber-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/FPT-Polytechnic_DN_ban_hang_thien_nguyen-1.png"
                  alt="Khoanh khac hoat dong thien nguyen"
                  className="h-[196px] w-full rounded-[14px] object-cover"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            Nhom sinh vien to chuc hoat dong gay quy tai cho.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto absolute left-20 bottom-14 w-[300px] rotate-[5deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-2 right-8 h-5 w-20 rotate-[10deg] rounded-sm border border-sky-200/70 bg-sky-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/image1-18.jpg"
                  alt="Nhung hinh anh yeu thuong"
                  className="h-[178px] w-full rounded-[14px] object-cover"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            Khoanh khac trao yeu thuong den nhung hoan canh kho khan.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto absolute right-4 top-20 w-[340px] rotate-[7deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[4deg] rounded-sm border border-lime-200/70 bg-lime-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/FPT-Polytechnic_HN_thien_nguyen_xanh-.jpg"
                  alt="Cong dong cung chung tay"
                  className="h-[206px] w-full rounded-[14px] object-cover"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={10}>
            Chien dich xanh voi su chung tay cua cong dong tre.
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto absolute right-12 bottom-12 w-[300px] rotate-[-6deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-2 left-12 h-5 w-20 rotate-[-9deg] rounded-sm border border-rose-200/70 bg-rose-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/register.png"
                  alt="Ky niem cung dong hanh"
                  className="h-[178px] w-full rounded-[14px] object-cover"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            Them mot ky niem dep tren hanh trinh dong hanh vi cong dong.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-black/10 text-sm text-black/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p>
            Hơn <NumberCounter value={userCount} /> nhà hảo tâm đã tin tưởng
          </p>
        </div> */}

        {/* Headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-6">
          <span className="block text-black">Cùng nhau</span>
          <span className="block">
            <MorphingText
              words={['Thay Đổi', 'Yêu Thương', 'Hy Vọng', 'Trao Tặng', 'Kết Nối']}
              interval={2500}
              className="text-primary morphingTextLineHeight"
            />
          </span>
          <span className="block text-black/80 text-3xl md:text-4xl lg:text-5xl">cuộc sống</span>
        </h1>

        <p className="text-lg md:text-xl text-black/60 max-w-2xl mx-auto mb-10 leading-relaxed">
          FCam là nền tảng kết nối nạn nhân da cam và cộng đồng trên cơ sở{' '}
          <HighlightText variant="marker" color="accent" className="text-black/80">
            thấu hiểu và sẻ chia{' '}
          </HighlightText>
          . Minh bạch hóa đóng góp - lan tỏa trách nhiệm xã hội bằng các hành động thiết thực, bền vững.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Magnetic intensity={0.4} range={80}>
            <Link href="/campaigns">
              <Button className="text-base px-2" variant={'default'}>
                Khám Phá Chiến Dịch
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Magnetic>
          <Magnetic intensity={0.3} range={60}>
            <Link href="/campaigns/create">
              <Button className="text-base px-2" variant={'outline'}>
                <Heart className="w-5 h-5 text-rose-400" />
                Tạo Chiến Dịch
              </Button>
            </Link>
          </Magnetic>
        </div>

        {/* Social proof row */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-black/40">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {['🧑', '👩', '👨', '🧕'].map((e, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full glass border border-black/20 flex items-center justify-center text-sm"
                >
                  {e}
                </div>
              ))}
            </div>
            <span>
              <NumberCounter value={userCount} prefix="+" /> nhà hảo tâm
            </span>
          </div>
          <div>
            ⭐️ <NumberCounter value={4.9} />
            /5 đánh giá
          </div>
          <div>🔒 Thanh toán bảo mật</div>
        </div>
      </div>
    </section>
  );
}
