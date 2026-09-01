# IMPLEMENTATION_PLAN.md — maksymalnie 5 kroków

Każdy krok wykonuj osobno.
Po każdym kroku:
1. uruchom typecheck,
2. uruchom testy,
3. uruchom production build,
4. napraw błędy przed rozpoczęciem następnego kroku.

---

# KROK 1 — Fundament projektu i model domenowy

## Cel
Utworzyć działający szkielet aplikacji i wszystkie reguły produktu bez backendu.

## Zadania
- Vue 3 + Vite + TypeScript.
- Pinia.
- Vue Router.
- Tailwind.
- Vitest.
- Zod.
- Supabase JS jako zależność, ale jeszcze bez połączenia.
- Utworzyć strukturę zgodną z `ARCHITECTURE.md`.
- Utworzyć:
  - `signSizes.ts`,
  - `productConstants.ts`,
  - `fonts.ts`,
  - typy projektu,
  - schematy Zod.
- Zaimplementować pure functions geometrii.
- Testy geometrii i dozwolonych linii.

## Prompt dla Codexa

```text
Przeczytaj AGENTS.md oraz wszystkie pliki docs/*.md.

Wykonaj wyłącznie KROK 1 z docs/IMPLEMENTATION_PLAN.md.

Zbuduj fundament Vue 3 + Vite + TypeScript oraz model domenowy.
Zaimplementuj predefiniowane formaty dokładnie zgodnie z PRODUCT_SPEC.md.
Cała geometria ma działać w milimetrach.

Nie twórz jeszcze finalnego UI i nie łącz się z Supabase.

Dodaj testy pure functions.
Na końcu uruchom typecheck, testy i production build.
Napraw wszystkie błędy.
```

## Definition of Done
- wszystkie formaty są w jednej konfiguracji,
- reguły linii działają,
- work area działa,
- otwory mają prawidłowe współrzędne,
- testy przechodzą.

---

# KROK 2 — Kreator i podgląd SVG

## Cel
Kompletny frontend kreatora działający lokalnie.

## Zadania
- `SizeSelector`.
- `LineCountSelector`.
- `LineEditor`.
- wybór fontu.
- wielkość fontu.
- horizontal alignment.
- vertical alignment.
- toggle tła.
- toggle otworów montażowych.
- Pinia `projectStore`.
- SVG preview.
- responsive layout.
- parametry URL `?size=...`.

## Prompt dla Codexa

```text
Przeczytaj dokumentację projektu.

Wykonaj wyłącznie KROK 2 z IMPLEMENTATION_PLAN.md.

Zbuduj kompletny frontend konfiguratora.
Wszystkie wartości mają pochodzić ze store i configów.
Nie duplikuj logiki geometrii w Vue.

Podgląd SVG musi używać rzeczywistych proporcji w mm.
Pokaż obszar roboczy tylko jako pomocniczą warstwę developerską możliwą do wyłączenia.
Otwory montażowe mają mieć średnicę 5 mm.

Nie integruj jeszcze bazy danych.

Na końcu uruchom typecheck, testy i build.
```

## Definition of Done
Użytkownik może skonfigurować całą tabliczkę i widzi poprawny podgląd na żywo.

---

# KROK 3 — Dane zamówienia i lokalny zapis/odtworzenie

## Cel
Dokończyć model użytkowy zanim zostanie dodana baza.

## Zadania
- formularz:
  - imię i nazwisko,
  - login,
  - numer zamówienia,
- Zod,
- localStorage jako tymczasowa persistencja developerska,
- serializacja pełnego `SignProject`,
- `schemaVersion: 1`,
- możliwość reload strony bez utraty projektu,
- test round-trip serialize -> deserialize.

## Prompt dla Codexa

```text
Wykonaj wyłącznie KROK 3.

Dodaj formularz danych zamówienia i walidację.
Dodaj tymczasową persistencję localStorage.

Najważniejszy test:
projekt zapisany i następnie odczytany musi dać identyczny
SignProjectConfiguration oraz identyczny podgląd geometryczny.

Nie integruj jeszcze Supabase.
```

## Definition of Done
Pełny projekt można zapisać lokalnie i bezstratnie odtworzyć.

---

# KROK 4 — Supabase przez MCP i zapis projektu

## Cel
Dodać produkcyjną persistencję.

## Przed rozpoczęciem
Skonfiguruj Supabase MCP zgodnie z `MCP_SUPABASE.md`.

## Zadania Codexa z MCP
- utworzyć / wybrać projekt Supabase,
- zastosować migrację `projects`,
- utworzyć indeksy,
- skonfigurować bezpieczne RLS / write path,
- wygenerować TypeScript DB types,
- przygotować `.env.example`,
- pobrać URL i publiczny klucz projektu do lokalnego `.env` bez commitowania sekretów,
- stworzyć `projectService.ts`,
- `createProject()`,
- `getProject(...)` tylko w bezpiecznym wariancie,
- po zapisie zwrócić UUID projektu.

## Prompt dla Codexa

```text
Wykonaj KROK 4.

Użyj skonfigurowanego Supabase MCP.
Najpierw sprawdź dostępne narzędzia MCP i projekt.
Nie zakładaj nazw ani identyfikatorów.

Utwórz bazę/migrację zgodnie z ARCHITECTURE.md.
Zwróć szczególną uwagę na RLS i dane osobowe.

Nie umieszczaj service role key w frontendzie ani repozytorium.

Następnie zaimplementuj projectService i zastąp tymczasowy zapis
localStorage zapisem do Supabase.
LocalStorage może pozostać jedynie jako draft/autosave.

Po zakończeniu pokaż krótko:
- jakie migracje zostały wykonane,
- jakie polityki RLS powstały,
- jakie env vars muszę posiadać.
```

## Definition of Done
Projekt zapisuje się do Supabase i otrzymuje UUID.

---

# KROK 5 — Odczyt, test E2E i finalny review

## Cel
Domknąć MVP.

## Zadania
- `/project/:id` albo bezpieczniejszy odpowiednik z tokenem,
- odczyt projektu,
- rekonstrukcja store,
- pełny podgląd,
- obsługa błędów / 404,
- finalny responsive review,
- accessibility,
- testy,
- lint/typecheck/build,
- sprawdzenie braku sekretów w repo,
- README z instrukcją uruchomienia.

## Prompt dla Codexa

```text
Wykonaj KROK 5 i finalny code review MVP.

Sprawdź cały projekt pod kątem:
- zgodności z PRODUCT_SPEC.md,
- TypeScript,
- walidacji Zod,
- bezpieczeństwa Supabase/RLS,
- responsywności,
- dostępności,
- edge cases,
- wycieku sekretów,
- poprawności wymiarów mm,
- pełnego round-trip zapisu i odczytu.

Nie dodawaj funkcji spoza MVP.

Uruchom wszystkie testy, typecheck i build.
Napraw znalezione problemy.
Na końcu przygotuj checklistę Definition of Done.
```

---

# Kolejność

```text
1. MODEL + GEOMETRIA
        ↓
2. KREATOR + SVG
        ↓
3. FORMULARZ + LOCAL SAVE
        ↓
4. SUPABASE + MCP
        ↓
5. LOAD + TEST + REVIEW
```
