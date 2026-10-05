/* =========================================================
   dreipunktoans – Script
   1. Mobile-Navigation (Hamburger-Menü)
   2. Header-Hintergrund beim Scrollen
   3. Aktiven Nav-Link je nach Scroll-Position hervorheben
   4. Platzhalter anzeigen, wenn ein Bild fehlt
   5. Galerie-Lightbox
   6. Kontaktformular per AJAX senden (Web3Forms / Formspree)
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. Mobile-Navigation ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  const closeMenu = () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('active', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

  /* ---------- 2. Header beim Scrollen ---------- */
  const header = document.getElementById('siteHeader');
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    const currentScrollY = window.scrollY;

    // 1. Hintergrund ab 40px dunkel machen (wie vorher)
    header.classList.toggle('scrolled', currentScrollY > 40);

    // 2. Leiste verstecken, wenn nach unten gescrollt wird, und anzeigen, wenn nach oben
    if (currentScrollY > lastScrollY && currentScrollY > 80) {
      // Wir scrollen nach unten UND sind weiter als 80px vom oberen Rand weg
      header.classList.add('hidden-header');
    } else {
      // Wir scrollen nach oben
      header.classList.remove('hidden-header');
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', onScroll);
  onScroll();

  /* ---------- 3. Aktiver Nav-Link je nach Scroll-Position ---------- */
  const sections = document.querySelectorAll('main section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { rootMargin: '-50% 0px -50% 0px' });

  sections.forEach(section => sectionObserver.observe(section));

  /* ---------- 4. Platzhalter, wenn ein Bild fehlt ---------- */
  document.querySelectorAll('.img-frame img').forEach(img => {
    img.addEventListener('error', () => {
      img.closest('.img-frame').classList.add('is-missing');
    }, { once: true });
  });

  /* ---------- 5. Galerie-Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  let lastFocused = null;

  document.querySelectorAll('.galerie-item').forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      lastFocused = item;
      lightboxClose.focus();
    });
  });

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = '';
    if (lastFocused) lastFocused.focus();
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lightbox.hidden) closeLightbox(); });

  /* ---------- 6. Kontaktformular per AJAX senden ---------- */
  const form = document.getElementById('kontaktForm');
  const status = document.getElementById('formStatus');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot-Check: Wurde das unsichtbare Feld ausgefüllt, war es vermutlich ein Bot.
    // Wir tun so, als wäre alles gutgegangen, senden aber nichts wirklich ab.
    const honeypot = form.querySelector('input[name="botcheck"]');
    if (honeypot && honeypot.value !== '') {
      status.textContent = 'Danke! Deine Nachricht wurde verschickt.';
      status.className = 'form-status success';
      form.reset();
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    status.textContent = 'Wird gesendet …';
    status.className = 'form-status';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        status.textContent = 'Danke! Deine Nachricht wurde verschickt.';
        status.classList.add('success');
        form.reset();
      } else {
        throw new Error('Serverfehler');
      }
    } catch (error) {
      status.textContent = 'Leider ist ein Fehler aufgetreten. Schreib uns gerne direkt per Mail.';
      status.classList.add('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- 7. Kalender mit Markern (Flatpickr) ---------- */
  // Hier trägst du alle Termine ein, an denen ihr schon spielt (Format: YYYY-MM-DD)
  const bekannteTermine = ["2026-09-23", "2026-09-24", "2026-09-25", "2026-09-27"];

  flatpickr("#booking-date", {
    locale: "de",          // Kalender auf Deutsch
    altInput: true,        // Zeigt dem User ein schönes Format (z.B. 15. November 2026)
    altFormat: "d. F Y",
    dateFormat: "Y-m-d",   // Das saubere Format, das in der E-Mail an euch verschickt wird
    
    // Diese Funktion prüft jeden Tag beim Zeichnen des Kalenders
    onDayCreate: function(dObj, dStr, fp, dayElem) {
      const dateObj = dayElem.dateObj;
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${d}`;

      // Wenn das Datum in eurer Liste steht, bekommt es die CSS-Klasse für den Punkt
      if (bekannteTermine.includes(dateString)) {
        dayElem.classList.add("event-marker");
      }
    }
  });

});
