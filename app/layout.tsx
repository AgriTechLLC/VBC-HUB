import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { MainNav } from '@/components/main-nav';

// Dynamically import the ChatButton component to avoid SSR issues
const ChatButton = dynamic(() => import('@/components/chat-button'), { 
  ssr: false,
});

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Virginia Blockchain Council',
  description: 'Your hub for blockchain news, legislation, and events in Virginia',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4 py-3">
                <MainNav />
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6 bg-muted/40">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    © {new Date().getFullYear()} Virginia Blockchain Council. All rights reserved.
                  </div>
                  <div className="flex items-center gap-4">
                    <a href="/about" className="text-sm hover:text-primary">About</a>
                    <a href="/contact" className="text-sm hover:text-primary">Contact</a>
                    <a href="/privacy" className="text-sm hover:text-primary">Privacy</a>
                    <a href="/terms" className="text-sm hover:text-primary">Terms</a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
          <ChatButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
