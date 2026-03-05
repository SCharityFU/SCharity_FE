import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const spaceMono = Space_Mono({
    subsets: ["latin"],
    weight: ["400", "700"],
    style: ["normal", "italic"],
    variable: "--font-space-mono",
});

export const metadata: Metadata = {
    title: "SCharity – Nền Tảng Gây Quỹ Từ Thiện",
    description: "Cùng nhau tạo nên sự thay đổi. Hỗ trợ các chiến dịch từ thiện ý nghĩa – giáo dục, y tế, môi trường và cứu trợ thiên tai.",
    keywords: ["từ thiện", "gây quỹ", "charity", "donate", "crowdfunding", "Vietnam"],
    openGraph: {
        title: "SCharity – Cùng Nhau Thay Đổi",
        description: "Nền tảng gây quỹ từ thiện minh bạch và uy tín tại Việt Nam",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" suppressHydrationWarning>
            <body className={`${spaceMono.variable} antialiased`}>
                <Navbar />
                <main>{children}</main>
                <Footer />
            </body>
        </html>
    );
}
