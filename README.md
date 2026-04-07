# HouseFinance 🏠

Aplikacja do zarządzania budżetem domowym — prototyp React z widokiem web (Dashboard) i mobilnym (Mobile).

## Szybki start

```bash
# Zainstaluj zależności
npm install

# Uruchom dev server
npm run dev
```

Otwórz http://localhost:5173

## Zawartość

- `src/App.jsx` — cały prototyp (3600+ linii)
- Widok **Dashboard** — desktop, pełna analityka
- Widok **Mobile** — symulator telefonu 375×820px

## Demo konta (auth)

| Numer | Użytkownik | Opis |
|-------|-----------|------|
| +48 100 000 001 | Kacper | Właściciel konta z household |
| +48 100 000 002 | Anna | Bez household (flow zaproszenia) |

**Kod OTP:** `123456`  
**Kod zaproszenia:** `847291`

## Stack

- React 18 + Vite
- Inline styles (bez CSS frameworka)
- Fonty: Outfit + DM Mono (Google Fonts)

## Planowany backend

- **Auth**: Supabase + Twilio SMS OTP
- **DB**: Supabase (PostgreSQL z Row Level Security)
- **Waluty**: NBP API (live kursy)

## Następne kroki w Claude Code

```
# Po wejściu do folderu i uruchomieniu claude:
"Rozbij src/App.jsx na strukturę komponentów: 
 src/components/, src/hooks/, src/utils/, src/constants/"
```
