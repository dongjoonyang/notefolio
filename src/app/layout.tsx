import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="ko">
      <body className="antialiased text-slate-900 bg-white" suppressHydrationWarning={true}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}