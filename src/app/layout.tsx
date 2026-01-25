import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from 'sonner';
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Metadata } from 'next'

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
        className="antialiased text-zinc-900 bg-white dark:text-zinc-100 dark:bg-zinc-950 transition-colors duration-300"
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
          {/* 💡 ThemeProvider 안쪽으로 옮기면 테마 연동이 더 확실합니다 */}
          <Toaster 
            position="bottom-center" 
            richColors 
            closeButton 
            duration={1500} // 💡 1.5초 후 자동으로 닫힘
          />
        </ThemeProvider>
        
        <SpeedInsights />
      </body>
    </html>
  );
}