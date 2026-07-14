import { Gilda_Display, Jost } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../components/AuthProvider';
import { CurrencyProvider } from '../components/CurrencyProvider';
import { WishlistProvider } from '../components/WishlistProvider';
import { CartProvider } from '../components/CartProvider';

const gilda = Gilda_Display({
  subsets: ['latin'],
  variable: '--font-gilda',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-jost',
  display: 'swap',
});

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
    <html lang="en" className={`${gilda.variable} ${jost.variable}`}>
      <head>
        <link rel="icon" href="/images/daiorus-mark.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/daiorus-mark.png" />
      </head>
      <body>
        <AuthProvider>
          <CurrencyProvider>
            <WishlistProvider>
              <CartProvider>{children}</CartProvider>
            </WishlistProvider>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
