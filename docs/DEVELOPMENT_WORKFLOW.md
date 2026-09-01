# Workflow pracy z GitHub i Vercel

## Cel

Każdy kolejny krok projektu ma być widoczny online przed połączeniem z `main`.

```text
feature branch
    ↓ push
Pull Request
    ↓ automatycznie
Vercel Preview + GitHub CI
    ↓ akceptacja Jakuba
merge do main
    ↓ automatycznie
Vercel Production
```

## Jednorazowa konfiguracja Vercel

1. Wejdź na [vercel.com](https://vercel.com) i zaloguj się przez GitHub.
2. Wybierz **Add New → Project**.
3. Wybierz repozytorium `ykapp-pl/plaqueDesigner`.
4. Pozostaw wykryty framework **Vite**.
5. Sprawdź ustawienia:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Production branch: `main`
6. Kliknij **Deploy**.

Po podłączeniu repozytorium Vercel utworzy osobny podgląd dla Pull Requesta. Podgląd nie zmienia wersji produkcyjnej.

## Zasady kolejnych sesji Codexa

Przed rozpoczęciem pracy:

```bash
git checkout main
git pull --ff-only origin main
git checkout -b feature/nazwa-kroku
npm ci
```

Codex wykonuje jeden krok, a następnie:

```bash
npm run typecheck
npm test
npm run build
git diff --check
git add .
git commit -m "opis zmiany"
git push -u origin feature/nazwa-kroku
```

Następnie tworzony jest Pull Request do `main`. Nie należy łączyć go przed:

- zakończeniem code review,
- przejściem GitHub Actions CI,
- sprawdzeniem adresu Vercel Preview,
- wyraźną akceptacją właściciela projektu.

Po akceptacji:

```bash
git checkout main
git pull --ff-only origin main
```

## Ważne zasady

- Nie wykonuj kolejnego kroku przed akceptacją poprzedniego.
- Nie umieszczaj sekretów Vercel ani Supabase w repozytorium.
- Zmienne środowiskowe dodawaj w Vercel w ustawieniach projektu.
- `main` jest gałęzią produkcyjną.
- Każdy krok powinien mieć osobny commit i Pull Request.
