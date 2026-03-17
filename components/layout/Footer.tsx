import Link from 'next/link';
import { Heart, Facebook, Twitter, Github, Mail } from 'lucide-react';

const footerLinks = {
  platform: [
    { href: '/campaigns', label: 'Chiến Dịch' },
    { href: '/campaigns/create', label: 'Tạo Chiến Dịch' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  about: [
    { href: '/#how-it-works', label: 'Cách Hoạt Động' },
    { href: '/about', label: 'Về Chúng Tôi' },
    { href: '/blog', label: 'Blog' },
  ],
  legal: [
    { href: '/privacy', label: 'Chính Sách Bảo Mật' },
    { href: '/terms', label: 'Điều Khoản Dịch Vụ' },
  ],
};

const socials = [
  { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
  { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
  { href: 'https://github.com', icon: Github, label: 'GitHub' },
  { href: 'mailto:contact@FCam.vn', icon: Mail, label: 'Email' },
];

export function Footer() {
  return (
    <footer className="border-t border-dark/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-violet-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-dark fill-dark" />
              </div>
              <span className="font-bold text-lg gradient-text">FCam</span>
            </Link>
            <p className="text-sm text-dark/50 leading-relaxed mb-6">
              Nền tảng gây quỹ từ thiện minh bạch, uy tín tại Việt Nam. Cùng nhau tạo nên sự thay đổi.
            </p>
            <div className="flex gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center hover:bg-dark/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-dark/60" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-sm text-dark mb-4">Nền Tảng</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-dark/50 hover:text-dark transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-dark mb-4">Về Chúng Tôi</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-dark/50 hover:text-dark transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-dark mb-4">Pháp Lý</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-dark/50 hover:text-dark transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Newsletter */}
            <div className="mt-8">
              <h3 className="font-semibold text-sm text-dark mb-3">Nhận Thông Báo</h3>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-1.5 rounded-lg glass text-sm text-dark placeholder-dark/30 outline-none border border-dark/10 focus:border-rose-500/50 transition-colors"
                />
                <button className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-violet-600 text-dark text-sm font-medium hover:opacity-90 transition-opacity">
                  Theo dõi
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-dark/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark/30">© 2025 FCam. Mọi quyền được bảo lưu.</p>
          <p className="text-sm text-dark/30">
            Made with <Heart className="w-3 h-3 inline text-rose-500 fill-rose-500" /> in Vietnam
          </p>
        </div>
      </div>
    </footer>
  );
}
