import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Stundenverrechnungssatz berechnen | Kostenloser Rechner für Schreiner & Tischler',
  description: 'Stundenverrechnungssatz berechnen nach der Vollkosten-Methode (BWA). Gemeinkostenfaktor, Branchenvergleich & Gewinnzuschlag für Schreiner, Tischler & Handwerker. Kostenlos, ohne Anmeldung — in 3 Minuten.',
  keywords: 'Stundenverrechnungssatz berechnen, Stundenverrechnungssatz Rechner, Stundensatz berechnen Handwerk, Stundensatz Schreiner, Stundensatz Tischler, Gemeinkostenfaktor berechnen, Vollkostenkalkulation Handwerk, BWA Kalkulation Schreiner, Stundenverrechnungssatz Formel, produktive Stunden berechnen, Handwerk Kalkulation, Selbstkosten berechnen Handwerk',
  authors: [{ name: 'Mario Esch' }],
  alternates: {
    canonical: 'https://svs.marioesch.de',
  },
  robots: {
    index: true,
    follow: true,
    'max-snippet': -1,
    'max-image-preview': 'large',
    'max-video-preview': -1,
  },
  openGraph: {
    title: 'Stundenverrechnungssatz berechnen — Kostenloser Rechner für Schreiner',
    description: 'Vollkosten-Kalkulation nach BWA in 3 Minuten. Gemeinkostenfaktor, Branchenvergleich & Gewinnzuschlag. Kostenlos & ohne Anmeldung.',
    type: 'website',
    url: 'https://svs.marioesch.de',
    siteName: 'SVS Rechner',
    locale: 'de_DE',
  },
  twitter: {
    card: 'summary',
    title: 'Stundenverrechnungssatz berechnen | Kostenloser Rechner',
    description: 'Vollkosten-Kalkulation nach BWA für Schreiner & Tischler. In 3 Minuten. Kostenlos.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Stundenverrechnungssatz-Rechner',
              description: 'Kostenloser Rechner zur Berechnung des Stundenverrechnungssatzes nach der Vollkosten-Methode (BWA) für Schreiner, Tischler und Handwerker.',
              url: 'https://svs.marioesch.de',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              author: {
                '@type': 'Person',
                name: 'Mario Esch',
                jobTitle: 'Schreinermeister',
              },
              inLanguage: 'de',
              isAccessibleForFree: true,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Wie berechne ich meinen Stundenverrechnungssatz als Schreiner?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Der Stundenverrechnungssatz ergibt sich aus der Vollkostenkalkulation: (Personalkosten + Sachkosten + Gewinnzuschlag) geteilt durch die produktiven Stunden pro Jahr. Nutze unseren kostenlosen Rechner für eine exakte Berechnung nach BWA.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Was ist ein guter Stundenverrechnungssatz für Schreiner?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Der Branchendurchschnitt für Schreiner liegt bei 66–78 €/h (netto). Gut kalkulierte Betriebe liegen bei 78–90 €/h. Unter 55 €/h ist existenzgefährdend.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Was ist der Gemeinkostenfaktor im Handwerk?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Der Gemeinkostenfaktor (GKF) ist das Verhältnis von Stundenverrechnungssatz zu Brutto-Stundenlohn. Er liegt bei Schreinern typischerweise zwischen 2,5× und 4,0×.',
                  },
                },
              ],
            }),
          }}
        />
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
