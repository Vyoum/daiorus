import './globals.css';

export const metadata = {
  title: 'DAIORUS | Fine Jewelry & Engagement Rings',
  description: 'Discover DAIORUS. Exquisite, ethically sourced gold and diamond jewelry crafted with intention and worn with grace.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
