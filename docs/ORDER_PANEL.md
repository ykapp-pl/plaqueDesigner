# Panel zamówień

Panel właściciela jest dostępny pod adresem `/panel` i nie jest linkowany z głównego kreatora.

Panel wymaga jednocześnie:

- potwierdzonego konta Supabase Auth z logowaniem e-mail + hasło,
- adresu e-mail wpisanego do tabeli `public.order_panel_access`.

## Pierwsza konfiguracja dostępu

1. W Supabase otwórz Authentication → Users i utwórz użytkownika z wybranym adresem e-mail oraz hasłem.
2. Potwierdź adres e-mail zgodnie z ustawieniami projektu.
3. W SQL Editor wykonaj poniższe zapytanie, podmieniając adres na adres właściciela panelu:

```sql
insert into public.order_panel_access (email)
values (lower(btrim('właściciel@example.com')))
on conflict (email) do update set active = true;
```

Nie wpisuj hasła do repozytorium ani do zapytania SQL. Dostęp można wyłączyć bez usuwania konta:

```sql
update public.order_panel_access
set active = false
where email = lower(btrim('właściciel@example.com'));
```

## Działanie

Wyszukiwanie numeru zamówienia jest dokładne po usunięciu spacji na początku i końcu. Wyniki są sortowane od najnowszego zapisu. Każdy projekt zawiera nick zamawiającego, numer zamówienia, daty zapisu, pełną konfigurację obszarów tekstowych oraz wizualizację. Panel nie zwraca tokenu i nie pokazuje kontrolek edycji. Zalogowany właściciel może usunąć wybrany projekt po dodatkowym potwierdzeniu; usunięcie jest trwałe.
