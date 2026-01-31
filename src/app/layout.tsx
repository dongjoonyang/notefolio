import { ThemeProvider } from "@/components/theme-provider";
import { Noto_Sans_KR } from "next/font/google"; // 1. 이미 임포트되어 있습니다.
import "./globals.css";
import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Metadata } from 'next'

// 💡 2. Noto Sans KR 폰트 설정
const notoColor = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: 'Plug Log',
  description: 'Plug Log 포트폴리오와 프로젝트를 확인해보세요.',
  openGraph: {
    title: 'Plug Log',
    description: 'Plug Log의 포트폴리오와 프로젝트를 확인해보세요.',
    url: 'https://www.pluglog.com/', 
    siteName: 'Plug Log',
    images: [
      {
        url: 'https://www.pluglog.com/og.png',
        width: 1200,
        height: 630,
        alt: 'Plug Log 로고',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plug Log',
    description: 'Plug Log 포트폴리오와 프로젝트를 확인해보세요.',
    images: ['https://www.pluglog.com/og.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body 
        /* 💡 3. className에 notoColor.className을 추가합니다. */
        className={`${notoColor.className} antialiased text-zinc-900 bg-white dark:text-zinc-100 dark:bg-zinc-950 transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster 
            position="bottom-center" 
            richColors 
            closeButton 
            duration={1500} 
          />
        </ThemeProvider>
        
        <SpeedInsights />
      </body>
    </html>
  );
}