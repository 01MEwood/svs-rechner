# SVS Rechner — Stundenverrechnungssatz für Schreiner

Vollkosten-Kalkulation nach BWA mit Wizard-UX.  
Mobile-first PWA, optimiert für Handwerksbetriebe.

## Features

- **Kaufmännisch korrekt**: Bezahlte Stunden (Kostenseite) vs. produktive Stunden (Kapazität)
- **Rechtsform-Erkennung**: Einzelunternehmer (kalk. Unternehmerlohn) vs. GmbH
- **Inhaber-Produktivanteil**: Separater Prozentsatz für den Meister
- **BWA-Referenzen**: Jedes Feld mit SKR03-Kontonummer und Branchenwerten
- **Gewinnzuschlag**: Eigener Step, nicht in Selbstkosten versteckt
- **PWA**: Add-to-Homescreen, offline-fähig, App-Feeling
- **Click-Tracking**: Funnel-Analyse über localStorage
- **Bewertungen**: 5-Sterne-Rating mit aggregierter Anzeige
- **Share**: WhatsApp + E-Mail Ergebnisversand

## Quick Start (lokal)

```bash
npm install
npm run dev
```

Öffne http://localhost:3000

## Deploy auf Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub → Vercel (empfohlen)

1. Push auf GitHub:
   ```bash
   git init
   git add .
   git commit -m "SVS Rechner v1.0"
   git remote add origin https://github.com/01MEwood/svs-rechner.git
   git push -u origin main
   ```

2. Gehe zu https://vercel.com/new
3. Import GitHub Repo `01MEwood/svs-rechner`
4. Vercel erkennt Next.js automatisch → Deploy

### Custom Domain einrichten

1. In Vercel Dashboard → Settings → Domains
2. Domain eintragen (z.B. `rechner.schreinerhelden.de`)
3. Bei IONOS DNS: CNAME → `cname.vercel-dns.com`

## PWA: Add to Homescreen

Funktioniert automatisch:
- **iPhone**: Safari → Teilen → "Zum Home-Bildschirm"
- **Android**: Chrome zeigt automatisch "App installieren"-Banner
- Voraussetzung: HTTPS (Vercel liefert das automatisch)

## Icons ersetzen

Die Icons unter `public/icon-192.png` und `public/icon-512.png` sind Platzhalter.  
Für Produktion: Eigenes Logo als 192×192 und 512×512 PNG erstellen.

## Tracking auswerten

Tracking-Daten liegen im localStorage des Browsers.  
In der Browser-Console:

```js
JSON.parse(localStorage.getItem('svs-tracking'))
JSON.parse(localStorage.getItem('svs-stats'))
```

Für zentrale Auswertung: Webhook in `lib/tracking.js` ergänzen (POST an n8n).

## Tech Stack

- Next.js 14 (App Router)
- React 18
- Keine externe DB (localStorage)
- PWA mit Service Worker
- Vercel Hosting

## Lizenz

Proprietär — Mario Esch / Schreinerhelden GmbH & Co. KG
