# martamerriday.com

Oficjalna strona autorki Marty Merriday: statyczny HTML, hostowany na GitHub Pages.

## Struktura

```
index.html            cała strona (treść edytuje się bezpośrednio tutaj)
404.html              strona „nie znaleziono”
CNAME                 domena dla GitHub Pages (www.martamerriday.com)
.nojekyll             wyłącza przetwarzanie przez Jekyll – pliki idą 1:1
assets/css/style.css  wszystkie style
assets/js/main.js     okna z fragmentami (natywny <dialog>)
assets/fonts/         Libre Franklin (woff2, OFL 1.1)
assets/img/           zdjęcia, okładka, ikony; recenzje/ – avatary recenzentów
files/                fragmenty do pobrania (epub, mobi, pdf, mp3)
```

Brak zależności, brak kroku budowania.

## Podgląd lokalny

```sh
python3 -m http.server 8000
# http://localhost:8000
```
