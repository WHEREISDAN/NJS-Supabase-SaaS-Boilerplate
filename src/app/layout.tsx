import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { StripeProvider } from '@/lib/stripe/stripe-provider';
import { AuthProvider } from '@/components/auth/auth-provider';
import { Inter } from 'next/font/google';


// Configure Inter font with Latin subset for better performance
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', // Optional: for CSS variable access
});

export const metadata: Metadata = {
  title: 'Next.js 15 SaaS Boilerplate',
  description: 'A modern SaaS boilerplate built with Next.js 15, TypeScript, and Tailwind CSS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${inter.className} antialiased`}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StripeProvider>
              {children}
            </StripeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
