# LinkedIn Profile Optimizer

Aplikacja webowa do analizy i optymalizacji profili LinkedIn przy użyciu Claude AI (Anthropic).

## Funkcje

- Przesyłanie profilu LinkedIn w formacie PDF (drag & drop lub kliknięcie)
- Analiza profilu przez model Claude Opus 4.6
- Streaming wyników w czasie rzeczywistym
- Szczegółowe sugestie w 8 obszarach:
  - Nagłówek i tytuł zawodowy
  - Sekcja "O mnie"
  - Doświadczenie zawodowe
  - Umiejętności
  - Rekomendacje i potwierdzenia
  - Aktywność i widoczność
  - SEO na LinkedIn
  - Ogólny wynik profilu (1-10)

## Stack technologiczny

- **Backend:** Node.js + Express + Multer + `@anthropic-ai/sdk`
- **Frontend:** React + Vite + Tailwind CSS + `react-markdown`

## Instalacja

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
# Uzupełnij ANTHROPIC_API_KEY w pliku .env
npm run dev
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:5173`

## Struktura projektu

```
linkedin-optimizer/
├── server/
│   ├── server.js          # Serwer Express
│   ├── package.json
│   └── .env.example
├── client/
│   ├── src/
│   │   ├── App.jsx              # Główny komponent
│   │   ├── index.css
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── DropZone.jsx     # Drag & drop upload
│   │       ├── Instructions.jsx # Instrukcja eksportu PDF
│   │       └── AnalysisResult.jsx # Wyświetlanie wyników
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
├── .gitignore
└── README.md
```

## Konfiguracja

Stwórz plik `server/.env` na podstawie `server/.env.example`:

```env
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
```

Klucz API uzyskasz na stronie: https://console.anthropic.com
