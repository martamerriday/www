// martamerriday.com – jedyny skrypt na stronie.
//   1. Okna z fragmentami książki/audiobooka (natywny <dialog>)
//   2. Recenzje: losowa kolejność + przewijanie po jednym rzędzie

// ---------- 1. Okna ----------
//   - przycisk z atrybutem data-dialog="ID" otwiera okno o danym id
//   - okno zamyka: przycisk ×, klawisz Esc (wbudowane) lub kliknięcie w tło
//   - przy zamknięciu zatrzymywane jest odtwarzanie audio

document.querySelectorAll('[data-dialog]').forEach((button) => {
  const dialog = document.getElementById(button.dataset.dialog);
  if (dialog) button.addEventListener('click', () => dialog.showModal());
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelector('.dialog__close')?.addEventListener('click', () => dialog.close());

  // Kliknięcie poza treścią okna (w przyciemnione tło) zamyka okno
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    const inside = event.clientX >= r.left && event.clientX <= r.right &&
                   event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) dialog.close();
  });

  dialog.addEventListener('close', () => {
    dialog.querySelectorAll('audio').forEach((audio) => audio.pause());
  });
});

// ---------- 2. Recenzje ----------
//   - przy każdym załadowaniu strony kolejność recenzji jest losowa
//   - widać jeden rząd naraz (3 na komputerze, mniej na wąskim ekranie)
//   - pod spodem: ‹ 1 2 3 4 ›
//   Bez JavaScriptu widać po prostu wszystkie recenzje.

const reviewList = document.querySelector('.reviews');
const reviewNav = document.querySelector('.reviews-nav');

if (reviewList && reviewNav) {
  const items = [...reviewList.children];

  // Losowa kolejność (algorytm Fishera–Yatesa)
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  items.forEach((item) => reviewList.append(item));

  let page = 0;
  let perPage = 0;

  // Liczba kolumn siatki = liczba recenzji na stronę
  const columns = () => getComputedStyle(reviewList).gridTemplateColumns.split(' ').length;
  const pageCount = () => Math.ceil(items.length / perPage);

  const navButton = (label, text, onClick) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', label);
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  };

  const show = (newPage) => {
    page = (newPage + pageCount()) % pageCount();   // zawija: po ostatniej jest pierwsza
    items.forEach((item, i) => { item.hidden = Math.floor(i / perPage) !== page; });
    reviewNav.querySelectorAll('[data-page]').forEach((b) => {
      if (Number(b.dataset.page) === page) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    const counter = reviewNav.querySelector('.reviews-nav__counter');
    if (counter) counter.textContent = `${page + 1} / ${pageCount()}`;
  };

  // Stała wysokość karuzeli: lista dostaje min-height równą najwyższej stronie,
  // więc przy przełączaniu stron nic pod nią nie skacze. Siatka rozciąga wtedy
  // niższe recenzje, żeby ramki na każdej stronie miały tę samą wysokość.
  const reserveHeight = () => {
    reviewList.style.minHeight = '';
    if (pageCount() <= 1) return;
    let tallest = 0;
    for (let p = 0; p < pageCount(); p++) {
      items.forEach((item, i) => { item.hidden = Math.floor(i / perPage) !== p; });
      tallest = Math.max(tallest, reviewList.offsetHeight);
    }
    show(page);   // przywróć bieżącą stronę (pomiar dzieje się przed odświeżeniem ekranu)
    reviewList.style.minHeight = `${tallest}px`;
  };

  const build = () => {
    const firstVisible = page * perPage;   // zachowaj mniej więcej pozycję przy zmianie szerokości
    perPage = columns();
    reviewNav.replaceChildren();
    if (pageCount() <= 1) {
      items.forEach((item) => { item.hidden = false; });
      reviewNav.hidden = true;
      reviewList.style.minHeight = '';
      return;
    }

    reviewNav.append(navButton('Poprzednie recenzje', '‹', () => show(page - 1)));
    if (pageCount() <= 5) {
      // Kilka stron: numerowane przyciski
      for (let p = 0; p < pageCount(); p++) {
        const b = navButton(`Recenzje, strona ${p + 1}`, String(p + 1), () => show(p));
        b.dataset.page = p;
        reviewNav.append(b);
      }
    } else {
      // Wąski ekran (dużo stron): sam licznik "3 / 10"
      const counter = document.createElement('span');
      counter.className = 'reviews-nav__counter';
      counter.setAttribute('aria-live', 'polite');
      reviewNav.append(counter);
    }
    reviewNav.append(navButton('Następne recenzje', '›', () => show(page + 1)));
    reviewNav.hidden = false;
    show(Math.floor(firstVisible / perPage));
    reserveHeight();
  };

  build();

  // Wysokość tekstu zmienia się też przy zmianie szerokości (bez zmiany liczby
  // kolumn) i po doładowaniu fontów, więc wtedy mierzymy ponownie.
  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(() => {
      if (columns() !== perPage) build();
      else reserveHeight();
    });
  });
  document.fonts?.ready.then(reserveHeight);
  window.addEventListener('load', reserveHeight);
}
