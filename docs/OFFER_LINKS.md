# Linki ofert

Adres klienta: `https://plaquedesigner.ykapp.pl/?k=<kod>` (działa również `/configurator?k=<kod>`).

Kod to losowy identyfikator 128-bitowy. Znaczenie przechowuje tabela `public.offer_links`, której lista jest niedostępna dla klientów API. W kodzie przeglądarki i repozytorium nie przechowujemy rzeczywistych identyfikatorów ofert.

Wariant ustala dozwoloną grupę formatów, domyślne tło, możliwość jego wyłączenia oraz dostępność jasnobrązowego koloru premium w obu selektorach. Przy każdym zapisie funkcja `projects` ponownie sprawdza aktywny kod i zgodność formatu, tła oraz kolorów. Linki zapisanych projektów nadal wymagają ich oddzielnego ID i tokenu dostępu.

Migracja tworzy 9 wariantów z losowymi kodami: po trzy dla każdej grupy formatów. Poniższe zapytanie służy właścicielowi do odczytu linków przez zaufany panel SQL (nigdy przez przeglądarkę klienta):

```sql
select allowed_size_ids, background_enabled as background_default_enabled,
  background_editable, premium_available,
  'https://plaquedesigner.ykapp.pl/?k=' || code as url
from public.offer_links where active
order by size_id, background_enabled, premium_available;
```

Ustawienie `active = false` unieważnia wybrany link, także dla nowych zapisów w już otwartej karcie. Nie unieważnia odczytu istniejących projektów. Migracja grupująca warianty wyłącza wszystkie poprzednie, jednoliterowe linki.

Szkice przechowujemy w localStorage osobno dla każdego kodu. Stary, wspólny szkic nie jest automatycznie importowany. Ograniczenia z serwera mają pierwszeństwo przed lokalnym szkicem i dodatkowymi parametrami URL.

Sam link nie potwierdza zakupu i jest wielokrotnego użytku. Każdy jego posiadacz może go przekazać dalej. `noindex` ogranicza indeksowanie, a `no-referrer` zapobiega wysyłaniu adresu z kodem do zasobów zewnętrznych.

Wdrożenie wymaga migracji `offer_links` i funkcji `projects` wraz z `offerPolicy.ts` (istniejące `verify_jwt = false`, uwierzytelnianie przez `withSupabase` w trybie `publishable`). Funkcja i frontend muszą być wdrożone razem: stary frontend bez kodu nie zapisze nowych projektów po aktualizacji funkcji.
