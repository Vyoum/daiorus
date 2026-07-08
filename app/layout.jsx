import './globals.css';

export const metadata = {
  title: 'DAIORUS | Fine Jewellery Worn With Grace',
  description:
    'Discover DAIORUS. BIS hallmarked gold jewellery crafted in India for everyday elegance — worn with grace.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/daiorus-mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/daiorus-mark.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
