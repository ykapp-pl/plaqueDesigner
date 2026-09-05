# PRODUCT_SPEC.md

## 1. Cel MVP

Kreator personalizowanych tabliczek drukowanych w 3D.

Użytkownik:
1. wybiera format,
2. wybiera liczbę linii tekstu,
3. konfiguruje każdą linię,
4. opcjonalnie włącza tło,
5. opcjonalnie włącza otwory montażowe,
6. wpisuje dane identyfikujące zamówienie,
7. zapisuje projekt.

System zapisuje projekt tak, aby można go było później odczytać i dokładnie odtworzyć.

---

## 2. Formaty

> Uwaga: zapis `wysokość x szerokość`.

```ts
export interface SignSizeDefinition {
  id: string
  heightMm: number
  widthMm: number
  allowedLineCounts: readonly number[]
  backgroundWorkAreaInsetMm: number
}

export const SIGN_SIZES: readonly SignSizeDefinition[] = [
  {
    id: '25x25',
    heightMm: 250,
    widthMm: 250,
    allowedLineCounts: [1, 2, 3],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '20x25',
    heightMm: 200,
    widthMm: 250,
    allowedLineCounts: [1, 2, 3],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '15x25',
    heightMm: 150,
    widthMm: 250,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '10x25',
    heightMm: 100,
    widthMm: 250,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
  {
    id: '15x15',
    heightMm: 150,
    widthMm: 150,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
  {
    id: '10x15',
    heightMm: 100,
    widthMm: 150,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
] as const
```

---

## 3. Liczba linii

Po wyborze formatu użytkownik wybiera liczbę linii wyłącznie z `allowedLineCounts`.

Przykłady:
- `25x25` -> 1 / 2 / 3,
- `15x25` -> 1 / 2,
- `10x15` -> 1 / 2.

Zmiana formatu:
- jeśli obecna liczba linii jest nadal dozwolona, zachowaj ją,
- jeśli przestaje być dozwolona, ustaw największą dozwoloną wartość nie większą od obecnej,
- nigdy nie zapisuj więcej linii niż `lineCount`.

---

## 4. Tło / obszar roboczy

Pole:
```ts
backgroundEnabled: boolean
```

### Bez tła

```ts
workArea = {
  x: 0,
  y: 0,
  width: sign.widthMm,
  height: sign.heightMm,
}
```

### Z tłem

```ts
const inset = selectedSize.backgroundWorkAreaInsetMm

workArea = {
  x: inset,
  y: inset,
  width: sign.widthMm - 2 * inset,
  height: sign.heightMm - 2 * inset,
}
```

### Wyniki

| Format | Fizyczny rozmiar | Inset | Obszar roboczy |
|---|---|---:|---|
| 25x25 | 250x250 | 10 mm/stronę | 230x230 |
| 20x25 | 200x250 | 10 mm/stronę | 180x230 |
| 15x25 | 150x250 | 10 mm/stronę | 130x230 |
| 10x25 | 100x250 | 5 mm/stronę | 90x240 |
| 15x15 | 150x150 | 5 mm/stronę | 140x140 |
| 10x15 | 100x150 | 5 mm/stronę | 90x140 |

W tabeli wymiary obszaru roboczego zapisane są jako `wysokość x szerokość`.

---

## 5. Otwory montażowe

Pole:
```ts
mountingHolesEnabled: boolean
```

Stałe:
```ts
export const MOUNTING_HOLE_DIAMETER_MM = 5
export const MOUNTING_HOLE_RADIUS_MM = MOUNTING_HOLE_DIAMETER_MM / 2
export const MOUNTING_HOLE_CENTER_INSET_MM = 7.5
```

Pozycje środków:

```ts
[
  { x: inset, y: inset },
  { x: width - inset, y: inset },
  { x: inset, y: height - inset },
  { x: width - inset, y: height - inset },
]
```

gdzie:
```ts
inset = MOUNTING_HOLE_CENTER_INSET_MM
```

SVG:
```html
<circle
  :cx="hole.x"
  :cy="hole.y"
  :r="MOUNTING_HOLE_RADIUS_MM"
/>
```

Otwory mają być częścią wizualizacji projektu i zapisanej konfiguracji przez flagę `mountingHolesEnabled`.

---

## 6. Konfiguracja linii

```ts
export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'center' | 'bottom'

export interface SignLine {
  id: string
  text: string
  fontFamily: string
  fontSizeMm: number
  horizontalAlign: HorizontalAlign
  verticalAlign: VerticalAlign
}
```

Każda linia edytowana niezależnie.

Minimalny zakres kontrolek:
- input tekstowy,
- select fontu,
- input/stepper rozmiaru fontu,
- left / center / right,
- top / center / bottom.

---

## 7. Strefy linii

Dla:
```ts
lineCount = N
```

wysokość strefy:

```ts
zoneHeight = workArea.height / N
```

Dla linii o indeksie `i`:

```ts
zone = {
  x: workArea.x,
  y: workArea.y + i * zoneHeight,
  width: workArea.width,
  height: zoneHeight,
}
```

`horizontalAlign`:
- left -> lewa część strefy,
- center -> środek,
- right -> prawa część.

`verticalAlign`:
- top -> górna część strefy,
- center -> środek,
- bottom -> dolna część.

Dodaj niewielki wewnętrzny `TEXT_SAFE_PADDING_MM` jako stałą konfiguracyjną, nie hardkodowaną w komponencie.

---

## 8. Dane klienta / zamówienia

```ts
export interface OrderMetadata {
  login: string
  orderNumber: string
}
```

W MVP wszystkie 3 pola wymagane.

Walidacja:
- trim,
- nie zapisuj pustych stringów,
- limit długości ustaw rozsądnie i centralnie w schemacie Zod.

---

## 9. Model zapisywanego projektu

```ts
export interface SignProjectConfiguration {
  schemaVersion: 1

  sizeId: string
  widthMm: number
  heightMm: number

  lineCount: number
  lines: SignLine[]

  backgroundEnabled: boolean
  mountingHolesEnabled: boolean
}

export interface SignProject {
  id?: string
  createdAt?: string
  updatedAt?: string

  customer: OrderMetadata
  configuration: SignProjectConfiguration
}
```

Zapisuj także `schemaVersion`, aby można było migrować stare projekty po rozwoju konfiguratora.

---

## 10. URL

MVP powinno akceptować co najmniej:
```text
/configurator?size=25x25
```

Parametr `size`:
- jest wartością startową,
- musi należeć do `SIGN_SIZES`,
- nie może tworzyć dowolnych wymiarów.

Architektura powinna umożliwić późniejsze dodanie parametrów:
- `background`,
- `mountingHoles`,
- `lines`,
- źródło / marketplace.

---

## 11. Kryteria odbioru

MVP jest gotowe, gdy:

- wszystkie 6 formatów działa,
- każdy format oferuje prawidłowe liczby linii,
- każda linia ma niezależny tekst/font/rozmiar/alignment X/Y,
- SVG odwzorowuje fizyczne proporcje,
- tło poprawnie zmniejsza obszar roboczy,
- otwory 5 mm pokazują się w czterech rogach,
- projekt można zapisać,
- projekt można pobrać po ID,
- odczytany projekt daje ten sam podgląd i ustawienia,
- zapis obejmuje login Allegro i numer zamówienia Allegro,
- testy logiki geometrii oraz walidacji przechodzą.
