# MCP_SUPABASE.md

## Po co MCP w tym projekcie?

MCP nie jest częścią aplikacji dla klienta.

MCP służy jako narzędzie developerskie dla Codexa, żeby mógł:
- pracować z projektem Supabase,
- wykonywać migracje,
- sprawdzać schemat,
- generować typy,
- analizować błędy,
- przygotować integrację bazy bez ręcznego przeklejania wszystkiego przez panel.

Aplikacja produkcyjna nadal komunikuje się normalnie z Supabase przez `@supabase/supabase-js` lub kontrolowany backend/Edge Function.

---

# 1. Utwórz konto / projekt Supabase

Jeżeli projekt jeszcze nie istnieje:

1. utwórz konto Supabase,
2. utwórz nowy projekt,
3. zapisz jego nazwę,
4. nie wklejaj haseł ani service-role key do promptów Codexa,
5. połącz Codexa z Supabase przez oficjalny remote MCP.

Preferuj osobny projekt developerski zamiast bezpośredniej pracy agenta na produkcji.

---

# 2. Oficjalny Supabase Remote MCP

Aktualny oficjalny endpoint:

```text
https://mcp.supabase.com/mcp
```

Supabase pozwala ograniczyć MCP do konkretnego projektu i zestawu funkcji.
W kreatorze konfiguracji Supabase wybierz swój projekt, aby agent nie miał dostępu do wszystkich projektów organizacji.

Do tworzenia aplikacji potrzebne są przede wszystkim grupy:
- docs,
- database,
- debugging,
- development.

`account` dodawaj tylko jeśli Codex rzeczywiście ma tworzyć/zarządzać samym projektem Supabase.

---

# 3. Podłączenie MCP do Codex

Codex przechowuje konfigurację w:

Windows:
```text
%USERPROFILE%\.codex\config.toml
```

macOS / Linux:
```text
~/.codex/config.toml
```

Ponieważ składnia i komendy Codex MCP mogą zmieniać się pomiędzy wersjami CLI:

1. sprawdź aktualną wersję:
```bash
codex --version
```

2. sprawdź dostępne komendy MCP:
```bash
codex mcp --help
```

3. dodaj remote HTTP MCP zgodnie z pomocą aktualnej wersji Codex, używając URL wygenerowanego przez stronę Supabase MCP.

Jeżeli Twoja wersja Codexa pozwala bezpośrednio konfigurować MCP w `config.toml`, wpis powinien zostać wygenerowany na podstawie aktualnej składni Codex, nie przez zgadywanie.

Po dodaniu serwera uruchom ponownie Codex i przejdź flow OAuth w przeglądarce.

OAuth jest preferowany względem ręcznego przechowywania PAT.

---

# 4. Jak sprawdzić MCP z Codexa

Po uruchomieniu Codexa wpisz:

```text
Sprawdź dostępne narzędzia Supabase MCP.
Nie wykonuj żadnych zmian.
Podaj:
- do jakiej organizacji/projektu masz dostęp,
- jakie grupy narzędzi są dostępne,
- czy masz write access.
```

Następnie:

```text
Użyj Supabase MCP w trybie tylko diagnostycznym.
Sprawdź aktualny schemat bazy i wymień istniejące tabele.
Nic nie modyfikuj.
```

Dopiero po tym zlecaj migracje.

---

# 5. Zadanie dla Codexa — utworzenie bazy przez MCP

```text
Użyj Supabase MCP.

Pracuj WYŁĄCZNIE na projekcie developerskim przypisanym do tego repozytorium.

Najpierw sprawdź aktualny schemat.
Następnie przygotuj migrację tworzącą tabelę public.projects:

- id uuid PK default gen_random_uuid()
- created_at timestamptz not null default now()
- updated_at timestamptz not null default now()
- full_name text not null
- login text not null
- order_number text not null
- size_id text not null
- configuration jsonb not null

Dodaj indeksy:
- order_number
- login
- created_at desc

Przygotuj także mechanizm aktualizacji updated_at.

Przed wykonaniem zmian pokaż plan migracji.
Następnie zastosuj migrację MCP i zweryfikuj wynik.

Nie twórz publicznych polityk SELECT dla wszystkich rekordów.
Nie wyłączaj RLS jako rozwiązania problemu.
Nie używaj service-role key po stronie frontendu.
```

---

# 6. RLS — ważne

Projekt przechowuje:
- imię i nazwisko,
- login,
- numer zamówienia.

To są dane, których nie należy udostępniać przez publiczne `SELECT *`.

Dla MVP rozważ jeden z dwóch wariantów.

## Wariant A — rekomendowany

```text
Browser
   ↓
Edge Function / backend endpoint
   ↓
Supabase
```

Frontend nie ma prawa swobodnego SELECT do tabeli.

Backend:
- waliduje payload,
- zapisuje projekt,
- generuje osobny bezpieczny token odczytu lub umożliwia odczyt tylko panelowi administracyjnemu.

## Wariant B — prostszy prototyp

Anon key + RLS pozwalający wyłącznie na `INSERT`.

Brak publicznego SELECT.

Projekt odczytujesz na razie z panelu / chronionej ścieżki developerskiej.

Nie implementuj:
```sql
using (true)
```
dla publicznego SELECT rekordów zawierających dane klienta.

---

# 7. Zmienne środowiskowe

Frontend:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

W repo:
```text
.env.example       <- TAK
.env               <- NIE
.env.local         <- NIE
```

`.gitignore`:
```gitignore
.env
.env.*
!.env.example
```

Nigdy po stronie frontendu:
```text
SUPABASE_SERVICE_ROLE_KEY
```

---

# 8. Generowanie typów

Po utworzeniu schematu zleć Codexowi przez MCP / narzędzia Supabase:

```text
Wygeneruj TypeScript types odpowiadające aktualnemu schematowi Supabase
i zapisz je w:
src/types/database.types.ts

Następnie skonfiguruj createClient<Database>(...).
```

---

# 9. Minimalny interfejs service

```ts
export interface CreateProjectInput {
  fullName: string
  login: string
  orderNumber: string
  sizeId: string
  configuration: SignProjectConfiguration
}

export interface CreatedProject {
  id: string
}

export interface ProjectRepository {
  createProject(input: CreateProjectInput): Promise<CreatedProject>
}
```

Warstwa UI nie powinna wiedzieć, czy zapis odbywa się przez:
- bezpośredni Supabase client,
- Edge Function,
- API.

Dzięki temu sposób zabezpieczenia backendu można zmienić bez przebudowy kreatora.

---

# 10. Bezpieczny sposób pracy agenta

Podczas developmentu:
- preferuj osobny projekt Supabase dev,
- ogranicz MCP do jednego projektu,
- ogranicz dostępne feature groups do wymaganych,
- przed destrukcyjną migracją wymagaj planu,
- nie pozwalaj agentowi pracować na produkcji bez ręcznego review,
- utrzymuj migracje SQL w repozytorium,
- traktuj migracje w repo jako audytowalne źródło zmian.

MCP jest wygodą developerską, nie mechanizmem autoryzacji aplikacji.
