import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";
import StoreProvider from "@/components/providers/StoreProvider";
import GoogleProvider from "@/components/providers/GoogleProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
        <html lang="vi" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Google+Sans+Text:wght@400;500;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="antialiased">
                <GoogleProvider>
                    <StoreProvider>
                        <AuthProvider>
                            <Navbar />
                            <main>{children}</main>
                            <Footer />
                        </AuthProvider>
                    </StoreProvider>
                </GoogleProvider>
            </body>
        </html>
    );
}
