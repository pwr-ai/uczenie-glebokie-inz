# Uczenie Głębokie — strona kursu

Strona kursu inżynierskiego **Uczenie Głębokie** (Politechnika Wrocławska) zbudowana na Hugo z motywem [Hextra](https://imfing.github.io/hextra/). Automatyczne wdrożenie na GitHub Pages za pomocą GitHub Actions.

## Wymagania lokalne

- [Hugo extended](https://gohugo.io/installation/) ≥ 0.120
- [Go](https://go.dev/dl/) ≥ 1.21 (do pobrania motywu jako Hugo Module)

Na macOS:

```sh
brew install hugo go
```

## Uruchomienie lokalne

```sh
# Pierwsze uruchomienie — pobierz motyw Hextra
hugo mod get -u github.com/imfing/hextra

# Dev server z hot-reload
hugo server
```

Otwórz <http://localhost:1313/>.

## Struktura treści

```
content/
├── _index.md               # strona główna
├── wyklady/                # wykłady (30h, 4 bloki)
├── laboratoria/            # laboratoria (15 × 1.5h, 6 bloków)
├── zespol/                 # prowadzący — UZUPEŁNIJ
└── informacje/             # informacje organizacyjne
```

Syllabus źródłowy pozostaje w [`doc.md`](./doc.md).

## Jak dodać/zmienić zespół

Edytuj [`content/zespol/_index.md`](./content/zespol/_index.md) — zastąp placeholder `{{< card >}}` prawdziwymi danymi (imię, rola, kontakt, opcjonalnie link do profilu i zdjęcie w `static/images/team/`).

## Wdrożenie na GitHub Pages

1. Wypchnij zmiany na gałąź `master` (lub `main`).
2. W repo przejdź do **Settings → Pages** i ustaw **Source: GitHub Actions** (jednorazowo).
3. Workflow [`.github/workflows/hugo.yml`](./.github/workflows/hugo.yml) automatycznie zbuduje i opublikuje stronę.
4. URL strony pojawi się w zakładce **Actions → Deploy Hugo site → deploy**.

`baseURL` jest ustawiany automatycznie przez `actions/configure-pages`, więc nie musisz go edytować w `hugo.yaml` pod konkretną nazwę użytkownika.

## Licencja

Treści dydaktyczne — © autorzy. Kod strony — MIT (jeśli nie określono inaczej).
