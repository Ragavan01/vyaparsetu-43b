import type {Metadata} from 'next';
import {IBM_Plex_Mono, Plus_Jakarta_Sans} from 'next/font/google';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

const ibmMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VyaparSetu 43B — MSME Invoice Audit, §37(2)(g) / §43B(h) & TReDS Copilot',
  description:
    'Obsidian Liquid Glass MSME invoice audit, Section 37(2)(g) & Section 43B(h) statutory compliance, and TReDS working-capital copilot built for Indore Pithampur & Sanwer Road clusters and Bharat 2036.',
  openGraph: {
    title: 'VyaparSetu 43B — MSME Statutory & Working-Capital Copilot',
    description:
      'Multimodal GST invoice audit, Section 37(2)(g)/43B(h) compliance tracking, TReDS arbitrage simulator, and Indore corridor intelligence.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VyaparSetu 43B — MSME Statutory & Working-Capital Copilot',
    description:
      'Built for Indore Pithampur & Sanwer Road MSMEs and architected for Bharat 2036.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${ibmMono.variable} dark`}
    >
      <body
        suppressHydrationWarning
        className="bg-[#05070D] text-[#F8FAFC] antialiased selection:bg-[#4F46E5]/35 selection:text-white"
      >
        {children}
      </body>
    </html>
  );
}


