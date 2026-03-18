'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart } from 'lucide-react';
import { MorphingText } from '@/components/ui/text-morphing';
import { Magnetic } from '@/components/ui/magnetic';
import { HighlightText } from '@/components/ui/highlight-text';
import { useGetActiveUserCountQuery } from '@/lib/store/features/home/homeApi';
import { NumberCounter } from '@/components/ui/number-counter';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel';

export function HeroSection() {
  const { data: userCount = 50000 } = useGetActiveUserCountQuery();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  const mobileStories = useMemo(
    () => [
      {
        src: '/assets/FPT-Polytechnic_DN_ban_hang_thien_nguyen-1.png',
        alt: 'Khoanh khac hoat dong thien nguyen',
        caption: 'Nhom sinh vien to chuc hoat dong gay quy tai cho.',
      },
      {
        src: '/assets/image1-18.jpg',
        alt: 'Nhung hinh anh yeu thuong',
        caption: 'Khoanh khac trao yeu thuong den nhung hoan canh kho khan.',
      },
      {
        src: '/assets/FPT-Polytechnic_HN_thien_nguyen_xanh-.jpg',
        alt: 'Cong dong cung chung tay',
        caption: 'Chien dich xanh voi su chung tay cua cong dong tre.',
      },
      {
        src: '/assets/register.png',
        alt: 'Ky niem cung dong hanh',
        caption: 'Them mot ky niem dep tren hanh trinh dong hanh vi cong dong.',
      },
    ],
    [],
  );

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () => {
      setActiveStoryIndex(carouselApi.selectedScrollSnap());
    };

    handleSelect();
    carouselApi.on('select', handleSelect);
    carouselApi.on('reInit', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
      carouselApi.off('reInit', handleSelect);
    };
  }, [carouselApi]);

  const scrollToStory = (index: number) => {
    carouselApi?.scrollTo(index);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center hero-gradient grid-pattern pt-16 overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Scrapbook side photos */}
      <div className="pointer-events-none absolute inset-0 z-0 hidden md:block">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="pointer-events-auto absolute left-2 top-20 w-[220px] rotate-[-7deg] lg:left-4 lg:top-24 lg:w-[270px] xl:left-5 xl:w-[320px] xl:rotate-[-8deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-3 left-10 h-6 w-24 rotate-[-7deg] rounded-sm border border-amber-200/70 bg-amber-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/FPT-Polytechnic_DN_ban_hang_thien_nguyen-1.png"
                  alt="Khoanh khac hoat dong thien nguyen"
                  className="h-[150px] lg:h-[170px] xl:h-[196px] w-full rounded-[14px] object-cover"
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
            <div className="pointer-events-auto absolute left-10 bottom-14 w-[210px] rotate-[4deg] lg:left-14 lg:w-[250px] xl:left-20 xl:w-[300px] xl:rotate-[5deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-2 right-8 h-5 w-20 rotate-[10deg] rounded-sm border border-sky-200/70 bg-sky-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/image1-18.jpg"
                  alt="Nhung hinh anh yeu thuong"
                  className="h-[138px] lg:h-[160px] xl:h-[178px] w-full rounded-[14px] object-cover"
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
            <div className="pointer-events-auto absolute right-2 top-20 w-[220px] rotate-[6deg] lg:right-3 lg:top-24 lg:w-[280px] xl:right-4 xl:top-20 xl:w-[340px] xl:rotate-[7deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-[4deg] rounded-sm border border-lime-200/70 bg-lime-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/FPT-Polytechnic_HN_thien_nguyen_xanh-.jpg"
                  alt="Cong dong cung chung tay"
                  className="h-[155px] lg:h-[178px] xl:h-[206px] w-full rounded-[14px] object-cover"
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
            <div className="pointer-events-auto absolute right-8 bottom-12 w-[210px] rotate-[-5deg] lg:right-10 lg:w-[250px] xl:right-12 xl:w-[300px] xl:rotate-[-6deg]">
              <div className="relative rounded-[20px] border border-black/10 bg-white p-2.5 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-2 left-12 h-5 w-20 rotate-[-9deg] rounded-sm border border-rose-200/70 bg-rose-100/80" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/register.png"
                  alt="Ky niem cung dong hanh"
                  className="h-[138px] lg:h-[160px] xl:h-[178px] w-full rounded-[14px] object-cover"
                />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" sideOffset={10}>
            Them mot ky niem dep tren hanh trinh dong hanh vi cong dong.
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
        {/* Badge */}
        {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-black/10 text-sm text-black/70 mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <p>
            Hơn <NumberCounter value={userCount} /> nhà hảo tâm đã tin tưởng
          </p>
        </div> */}

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black leading-[1.08] sm:leading-tight mb-5 sm:mb-6">
          <span className="block text-black">Cùng nhau</span>
          <span className="block">
            <MorphingText
              words={['Thay Đổi', 'Yêu Thương', 'Hy Vọng', 'Trao Tặng', 'Kết Nối']}
              interval={2500}
              className="text-primary morphingTextLineHeight"
            />
          </span>
          <span className="block text-black/80 text-3xl sm:text-4xl md:text-4xl lg:text-5xl mt-1 sm:mt-0">
            cuộc sống
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-black/60 max-w-2xl mx-auto mb-8 sm:mb-10 leading-7 sm:leading-relaxed">
          FCam là nền tảng kết nối nạn nhân da cam và cộng đồng trên cơ sở{' '}
          <HighlightText variant="marker" color="accent" className="text-black/80">
            thấu hiểu và sẻ chia{' '}
          </HighlightText>
          . Minh bạch hóa đóng góp - lan tỏa trách nhiệm xã hội bằng các hành động thiết thực, bền vững.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Magnetic intensity={0.4} range={80}>
            <Link href="/campaigns">
              <Button className="text-base px-4 sm:px-2" variant={'default'}>
                Khám Phá Chiến Dịch
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </Magnetic>
          <Magnetic intensity={0.3} range={60}>
            <Link href="/campaigns/create">
              <Button className="text-base px-4 sm:px-2" variant={'outline'}>
                <Heart className="w-5 h-5 text-rose-400" />
                Tạo Chiến Dịch
              </Button>
            </Link>
          </Magnetic>
        </div>

        {/* Mobile story carousel */}
        <div className="md:hidden mt-8 sm:mt-10">
          <Carousel setApi={setCarouselApi} opts={{ align: 'center', loop: false }}>
            <CarouselContent className="-ml-3">
              {mobileStories.map((story) => (
                <CarouselItem key={story.src} className="pl-3 basis-[86%] sm:basis-[70%]">
                  <article className="rounded-2xl border border-black/10 bg-white/85 p-2.5 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.45)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={story.src} alt={story.alt} className="h-48 sm:h-56 w-full rounded-xl object-cover" />
                    <p className="mt-3 text-left text-sm leading-relaxed text-black/70">{story.caption}</p>
                  </article>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <div className="mt-4 flex items-center justify-center gap-2">
            {mobileStories.map((story, index) => (
              <button
                key={story.src + '-dot'}
                type="button"
                onClick={() => scrollToStory(index)}
                className={`h-2 rounded-full transition-all ${
                  activeStoryIndex === index ? 'w-6 bg-black/80' : 'w-2 bg-black/25 hover:bg-black/40'
                }`}
                aria-label={`Xem anh ${index + 1}`}
                aria-current={activeStoryIndex === index}
              />
            ))}
          </div>
        </div>

        {/* Social proof row */}
        <div className="mt-12 sm:mt-16 flex flex-wrap md:flex-col lg:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-black/40">
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
