import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Stundenverrechnungssatz-Rechner | Für Schreiner',
  description: 'Berechne deinen Stundenverrechnungssatz nach der Vollkosten-Methode. Mit BWA-Referenzen, Branchenvergleich und Gewinnzuschlag. Kostenlos, ohne Anmeldung.',
  keywords: 'Stundenverrechnungssatz, Schreiner, Kalkulation, BWA, Gemeinkostenfaktor, Handwerk',
  authors: [{ name: 'Mario Esch' }],
  openGraph: {
    title: 'Stundenverrechnungssatz-Rechner für Schreiner',
    description: 'Vollkosten-Kalkulation nach BWA — in 3 Minuten.',
    type: 'website',
    url: 'https://svs.marioesch.de',
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': 'SVS Rechner',
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#E8710A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        background: '#FAFAF9',
        minHeight: '100dvh',
        WebkitTextSizeAdjust: '100%',
      }}>
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {});
          }
        `}</Script>
      </body>
    </html>
  );
}
