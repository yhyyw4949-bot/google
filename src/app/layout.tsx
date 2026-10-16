import type { Metadata } from 'next';
import { Cairo, Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Google AI Pro Store | متجر اشتراكات Google AI Pro في مصر',
  description: 'المتجر المستقل الأول لتوفير دعوات اشتراك Google AI Pro في مصر بـ 25 جنيه عبر فودافون كاش وإنستاباي مع سرعة تفعيل ودعم متواصل.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#070913] text-[#f8fafc] antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-grow flex flex-col">{children}</main>
            <Footer />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
