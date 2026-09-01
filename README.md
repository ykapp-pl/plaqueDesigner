# Plaque Designer

Konfigurator personalizowanych tabliczek przeznaczonych do druku 3D.

## Uruchomienie

```bash
npm install
npm run dev
```

## Weryfikacja

```bash
npm run typecheck
npm test
npm run build
```

## Zmienne środowiskowe

Skopiuj `.env.example` do `.env` i wpisz URL projektu Supabase oraz publiczny klucz `publishable`. Pliku `.env` nie commituj. Klucz service-role jest używany wyłącznie przez warstwę serwerową Supabase.

Projekt jest rozwijany etapami zgodnie z [planem implementacji](./docs/IMPLEMENTATION_PLAN.md).

## Praca zdalna

Proces Pull Requestów, automatycznej weryfikacji i podglądów Vercel opisuje [workflow deweloperski](./docs/DEVELOPMENT_WORKFLOW.md).
