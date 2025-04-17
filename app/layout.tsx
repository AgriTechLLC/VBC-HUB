import './globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';

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
          {children}
          <Toaster />
          <ChatButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
