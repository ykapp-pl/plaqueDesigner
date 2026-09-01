# ARCHITECTURE.md

## 1. Stack

### Frontend
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS

### Wizualizacja
- SVG

### Walidacja
- Zod

### Testy
- Vitest
- Vue Test Utils

### Persistencja
- Supabase
- PostgreSQL
- `configuration` jako `JSONB`

---

## 2. Struktura

```text
src/
├── components/
│   ├── configurator/
│   │   ├── SizeSelector.vue
│   │   ├── LineCountSelector.vue
│   │   ├── LineEditor.vue
│   │   ├── FontSelector.vue
│   │   ├── FontSizeControl.vue
│   │   ├── HorizontalAlignment.vue
│   │   ├── VerticalAlignment.vue
│   │   ├── BackgroundToggle.vue
│   │   └── MountingHolesToggle.vue
│   ├── preview/
│   │   └── SignPreview.vue
│   └── order/
│       └── OrderMetadataForm.vue
├── config/
│   ├── signSizes.ts
│   ├── fonts.ts
│   └── productConstants.ts
├── domain/
│   ├── signProject.ts
│   ├── geometry.ts
│   └── validation.ts
├── stores/
│   └── projectStore.ts
├── services/
│   └── projectService.ts
├── lib/
│   └── supabase.ts
├── views/
│   ├── ConfiguratorView.vue
│   ├── ProjectView.vue
│   └── SuccessView.vue
└── router/
    └── index.ts
```

---

## 3. Przepływ danych

```text
URL params
    │
    ▼
ProjectStore (Pinia)
    │
    ├──────────────► controls
    │
    ├──────────────► geometry helpers
    │                      │
    │                      ▼
    └────────────────► SVG preview
                           │
                           ▼
                 SignProjectConfiguration
                           │
                           ▼
                    projectService
                           │
                           ▼
                       Supabase
```

---

## 4. Logika geometryczna

Logiki matematycznej NIE umieszczaj w `SignPreview.vue`.

W `domain/geometry.ts` utwórz pure functions:

```ts
getWorkArea(...)
getLineZones(...)
getHorizontalTextPosition(...)
getVerticalTextPosition(...)
getMountingHoleCenters(...)
```

Każda funkcja:
- bierze jawne argumenty,
- nie zależy od Vue,
- nie zależy od store,
- ma testy jednostkowe.

Dzięki temu tę samą geometrię będzie można później wykorzystać przy eksporcie CAD/STL/3MF.

---

## 5. SVG

Dla tabliczki:
- szerokość fizyczna -> szerokość viewBox,
- wysokość fizyczna -> wysokość viewBox.

Przykład format `20x25`:
```html
<svg viewBox="0 0 250 200">
```

UWAGA:
nazwa formatu jest `wysokość x szerokość`, ale SVG i kod geometryczny używa:
```ts
widthMm
heightMm
```

Nie zamieniaj tych wartości.

---

## 6. Baza danych

Tabela MVP:

```sql
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  full_name text not null,
  login text not null,
  order_number text not null,

  size_id text not null,
  configuration jsonb not null
);
```

Indeksy:
```sql
create index projects_order_number_idx
  on public.projects(order_number);

create index projects_login_idx
  on public.projects(login);

create index projects_created_at_idx
  on public.projects(created_at desc);
```

`configuration` jest źródłem prawdy dla projektu.

Pola `size_id`, `order_number`, `login` są dodatkowo wyciągnięte do kolumn, ponieważ mają być łatwe do wyszukiwania.

---

## 7. Bezpieczeństwo MVP

Publiczna strona nie może mieć możliwości:
- odczytania wszystkich projektów,
- modyfikowania dowolnych projektów,
- wykonywania dowolnego SQL.

Jeżeli zapis projektu odbywa się anonimowo, preferowana architektura:
- frontend -> bezpieczny endpoint / Edge Function -> Supabase,
lub
- bardzo precyzyjna polityka RLS pozwalająca tylko na INSERT.

Nie umieszczaj `SUPABASE_SERVICE_ROLE_KEY` w kodzie frontendu.

Jeśli odczyt projektu ma być dostępny przez publiczny UUID, traktuj UUID jako identyfikator, NIE jako pełny mechanizm bezpieczeństwa. Dla danych osobowych lepiej docelowo zastosować token dostępu / panel chroniony autoryzacją.

---

## 8. Testy

Minimalnie:

### geometry.test.ts
- obszar roboczy bez tła,
- inset 10 mm,
- inset 5 mm,
- podział na 1 / 2 / 3 strefy,
- pozycje 4 otworów,
- średnica 5 mm.

### projectStore.test.ts
- dozwolone liczby linii,
- zmiana formatu,
- redukcja liczby linii po zmianie formatu,
- zachowanie danych aktywnych linii.

### validation.test.ts
- wymagane dane zamówienia,
- niepoprawny `sizeId`,
- niepoprawny `lineCount`,
- liczba linii zgodna z konfiguracją.

---

## 9. Gotowość na kolejne wersje

Model powinien móc później przyjąć:

```ts
backgroundMaterialId?: string
foregroundMaterialId?: string
shapeId?: string
graphics?: GraphicElement[]
manualPosition?: { xMm: number; yMm: number }
rotationDeg?: number
```

Nie implementuj tych pól w UI MVP.
