import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Grace - Салон красоты',
  description: 'Запись в салон красоты Grace через Telegram',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
  themeColor: '#ec4899',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}