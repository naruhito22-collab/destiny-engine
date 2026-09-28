import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'DESTINY ENGINE',
  description: '運命演算 — 占う、そして動く。',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ja"><body>{children}</body></html>;
}
