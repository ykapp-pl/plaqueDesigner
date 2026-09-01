# CODEX_START.md

## Start pracy

Uruchom Codex w katalogu repozytorium i wklej:

```text
Przeczytaj w całości:
- AGENTS.md
- docs/PRODUCT_SPEC.md
- docs/ARCHITECTURE.md
- docs/IMPLEMENTATION_PLAN.md
- docs/MCP_SUPABASE.md

To jest specyfikacja nadrzędna projektu.

Nie implementuj funkcjonalności spoza MVP.
Jeżeli dokumenty są sprzeczne, zatrzymaj implementację danego fragmentu i wskaż sprzeczność.

Rozpocznij od KROKU 1 z IMPLEMENTATION_PLAN.md.
Po zakończeniu wykonaj testy, typecheck i production build.
```

## Ważne

Nie dawaj od razu Codexowi wszystkich 5 kroków do autonomicznego wykonania.

Zalecany tryb:
1. zleć krok,
2. przeczytaj podsumowanie,
3. sprawdź działającą aplikację / diff,
4. commit,
5. dopiero potem przejdź do następnego kroku.

Przykładowe commity:

```text
feat: add sign domain model and geometry
feat: add configurator and svg preview
feat: add order metadata and local drafts
feat: add supabase project persistence
feat: add project loading and final validation
```
