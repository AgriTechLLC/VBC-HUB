import '../globals.css';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

// Dynamically import the ChatButton component to avoid SSR issues
const ChatButton = dynamic(() => import('@/components/chat-button'), { 
  ssr: false,
});

const montserrat = Montserrat({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Virginia Blockchain Council',
  description: 'Your hub for blockchain news, legislation, and events in Virginia',
};

export async function generateMetadata(
  { params }: { params: { locale: string } }
) {
  const messages = await import(`../../messages/${params.locale}.json`);
  
  return {
    title: messages.app?.title || 'Virginia Blockchain Council',
    description: 'Your hub for blockchain news, legislation, and events in Virginia',
  };
}

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Load messages for the current locale
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // Default to English if locale file not found
    messages = (await import('../../messages/en.json')).default;
  }

  return (
    <html lang={locale}>
      <body className={montserrat.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
            <ChatButton />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}