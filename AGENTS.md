# AGENTS.md — Sign Configurator

## Cel projektu

Aplikacja webowa do konfiguracji personalizowanych tabliczek przeznaczonych do druku 3D.

MVP ma umożliwiać:
- wybór jednego z predefiniowanych rozmiarów tabliczki,
- wybór liczby linii tekstu dozwolonej dla danego rozmiaru,
- edycję każdej linii niezależnie,
- podgląd projektu w SVG,
- opcjonalne tło,
- opcjonalne otwory montażowe,
- zebranie danych zamówienia,
- zapis pełnej konfiguracji projektu,
- odczyt zapisanego projektu po ID.

## Stack

- Vue 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Tailwind CSS
- SVG
- Zod
- Vitest
- Supabase JS
- PostgreSQL / Supabase

## Zasady architektury

1. Używaj Vue Composition API i `<script setup lang="ts">`.
2. Logika produktu nie może być zaszyta w komponentach UI.
3. Wszystkie wymiary fizyczne przechowuj w milimetrach.
4. Układ współrzędnych SVG odpowiada milimetrom projektu:
   - tabliczka 250 x 200 mm -> `viewBox="0 0 250 200"`.
5. Predefiniowane rozmiary przechowuj wyłącznie w `src/config/signSizes.ts`.
6. Parametry mechaniczne przechowuj w `src/config/productConstants.ts`.
7. Konfigurację fontów przechowuj w `src/config/fonts.ts`.
8. Stan aktualnego projektu przechowuj w Pinia.
9. Dostęp do Supabase może występować tylko w warstwie `services`.
10. Komponenty Vue nie wykonują bezpośrednich zapytań do Supabase.
11. Dane z URL, bazy i formularzy waliduj przez Zod.
12. Nie zapisuj sekretów ani service-role key w repozytorium.
13. Zapisany projekt ma być możliwy do pełnego odtworzenia z `configuration JSONB`.
14. Nie rozszerzaj zakresu MVP bez wyraźnego polecenia.

## Predefiniowane formaty

Format zapisywany jest jako: `wysokość x szerokość`.

| ID | Wysokość | Szerokość | Dozwolone linie |
|---|---:|---:|---|
| 25x25 | 250 mm | 250 mm | 1, 2, 3 |
| 20x25 | 200 mm | 250 mm | 1, 2, 3 |
| 15x25 | 150 mm | 250 mm | 1, 2 |
| 10x25 | 100 mm | 250 mm | 1, 2 |
| 15x15 | 150 mm | 150 mm | 1, 2 |
| 10x15 | 100 mm | 150 mm | 1, 2 |

## Tło i obszar roboczy

Jeżeli `backgroundEnabled = false`:
- obszar roboczy tekstu jest równy pełnemu formatowi tabliczki, z wyjątkiem bezpiecznych stref wynikających z otworów montażowych.

Jeżeli `backgroundEnabled = true`:
- dla formatów `25x25`, `20x25`, `15x25`: inset obszaru roboczego wynosi 10 mm z KAŻDEJ strony,
- dla formatów `10x25`, `15x15`, `10x15`: inset obszaru roboczego wynosi 5 mm z KAŻDEJ strony.

Przykłady:
- 250 x 250 mm z tłem -> obszar roboczy 230 x 230 mm,
- 200 x 250 mm z tłem -> obszar roboczy 180 x 230 mm,
- 100 x 150 mm z tłem -> obszar roboczy 90 x 140 mm.

## Otwory montażowe

Opcja: `mountingHolesEnabled`.

Jeżeli włączona:
- wygeneruj 4 okrągłe otwory,
- średnica każdego otworu: 5 mm,
- po jednym w każdym rogu,
- domyślny środek otworu: 7.5 mm od obu najbliższych krawędzi,
- parametr ma pochodzić ze stałej `MOUNTING_HOLE_CENTER_INSET_MM`,
- średnica ma pochodzić ze stałej `MOUNTING_HOLE_DIAMETER_MM`.

Nie hardkoduj współrzędnych otworów w komponencie SVG.

## Linie tekstu

Użytkownik wybiera liczbę linii spośród wartości dozwolonych przez format.

Każda linia zawiera:
- `text`
- `fontFamily`
- `fontSizeMm`
- `horizontalAlign`: `left | center | right`
- `verticalAlign`: `top | center | bottom`

Każda linia ma własną pionową strefę w obszarze roboczym.

Dla N linii:
- podziel wysokość obszaru roboczego na N równych stref,
- `verticalAlign` pozycjonuje tekst w obrębie strefy,
- `horizontalAlign` pozycjonuje tekst w obrębie szerokości obszaru roboczego.

## Dane zamówienia

Wymagane:
- `login` Allegro
- `orderNumber` Allegro

Nie zbieraj imienia ani nazwiska klienta.

## Zakres poza MVP

Nie implementuj bez dodatkowego polecenia:
- logowania użytkowników,
- kont klientów,
- płatności,
- koszyka,
- integracji Allegro API,
- Three.js,
- STL/3MF,
- uploadu grafik,
- dowolnego drag&drop tekstu,
- rotacji tekstu,
- własnych fontów użytkownika,
- dowolnego rozmiaru tabliczki,
- systemu cenowego,
- rozbudowanego panelu administracyjnego.
