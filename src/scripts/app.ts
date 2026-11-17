// Alle Animationen ohne Bibliothek: IntersectionObserver, CSS-Transitions und requestAnimationFrame.
// Der Hero-Shader wird nur auf der Startseite und erst im Leerlauf nachgeladen.

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

const cleanups: (() => void)[] = [];

const on = <K extends keyof HTMLElementEventMap>(
  el: HTMLElement | Document | Window,
  type: K | string,
  fn: (e: any) => void,
  opts?: AddEventListenerOptions,
) => {
  el.addEventListener(type, fn, opts);
  cleanups.push(() => el.removeEventListener(type, fn, opts));
};

function setupHeader() {
  const header = document.querySelector<HTMLElement>('[data-header]');
  const btn = document.querySelector<HTMLButtonElement>('[data-menu-btn]');
  const label = document.querySelector<HTMLElement>('[data-menu-label]');
  if (!header || !btn) return;

  const onScroll = () => header.classList.toggle('is-stuck', window.scrollY > 24);
  onScroll();
  on(window, 'scroll', onScroll, { passive: true });

  const setOpen = (open: boolean) => {
    header.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = (open ? btn.dataset.close : btn.dataset.open) ?? '';
  };
  on(btn, 'click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  on(document, 'keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      btn.focus();
    }
  });
}

function setupReveals() {
  const items = document.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;
  if (reduceQuery.matches || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      let i = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.style.setProperty('--d', `${Math.min(i++, 4) * 40}ms`);
        el.classList.add('is-in');
        io.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

function setupCounters() {
  const items = document.querySelectorAll<HTMLElement>('[data-count]');
  if (reduceQuery.matches || !items.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        io.unobserve(el);
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix ?? '';
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 700);
          el.textContent = `${Math.round(target * (1 - (1 - t) ** 3))}${suffix}`;
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  items.forEach((el) => io.observe(el));
  cleanups.push(() => io.disconnect());
}

function setupMagnetic() {
  if (reduceQuery.matches || !finePointer.matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    on(el, 'pointermove', (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.3;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.4;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
    on(el, 'pointerleave', () => (el.style.transform = ''));
  });
}

function setupTilt() {
  if (reduceQuery.matches || !finePointer.matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    on(el, 'pointermove', (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
      const rx = -((e.clientY - r.top) / r.height - 0.5) * 7;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    on(el, 'pointerleave', () => (el.style.transform = ''));
  });
}

function setupCursor() {
  const el = document.querySelector<HTMLElement>('[data-cursor]');
  if (!el || reduceQuery.matches || !finePointer.matches) return;
  const root = document.documentElement;
  let x = 0;
  let y = 0;
  let tx = 0;
  let ty = 0;
  let scale = 1;
  let ts = 1;
  let raf = 0;
  let shown = false;

  const frame = () => {
    x += (tx - x) * 0.45;
    y += (ty - y) * 0.45;
    scale += (ts - scale) * 0.3;
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    const moving = Math.abs(tx - x) > 0.1 || Math.abs(ty - y) > 0.1 || Math.abs(ts - scale) > 0.01;
    raf = moving ? requestAnimationFrame(frame) : 0;
  };
  on(window, 'pointermove', (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX;
    ty = e.clientY;
    if (!shown) {
      // Systemcursor erst ausblenden, wenn der Kreis wirklich sichtbar ist
      x = tx;
      y = ty;
      shown = true;
      root.classList.add('has-cursor');
      el.style.opacity = '1';
    }
    ts = (e.target as Element | null)?.closest?.('a, button, summary, input, textarea, label') ? 1.7 : 1;
    if (!raf) raf = requestAnimationFrame(frame);
  }, { passive: true });
  on(document.documentElement, 'pointerleave', () => (el.style.opacity = '0'));
  on(document.documentElement, 'pointerenter', () => shown && (el.style.opacity = '1'));
  cleanups.push(() => cancelAnimationFrame(raf));
}

function setupHero() {
  const canvas = document.querySelector<HTMLCanvasElement>('[data-hero-canvas]');
  if (!canvas) return;
  const start = async () => {
    const { initHeroShader } = await import('./hero-shader');
    initHeroShader(canvas, reduceQuery.matches);
  };
  const idle = () =>
    'requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 300);
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}

// FAQ: <details> öffnet und schließt sonst ohne Übergang. Hier wird die Höhe weich animiert.
// Ohne JS bzw. mit reduzierter Bewegung bleibt das normale Verhalten erhalten.
function setupFaq() {
  if (reduceQuery.matches) return;
  document.querySelectorAll<HTMLDetailsElement>('.faq details').forEach((item) => {
    const summary = item.querySelector('summary');
    if (!summary) return;
    let anim: Animation | null = null;

    const run = (from: number, to: number, opening: boolean) => {
      item.classList.toggle('is-opening', opening);
      item.classList.toggle('is-closing', !opening);
      item.style.overflow = 'hidden';
      anim = item.animate({ height: [`${from}px`, `${to}px`] }, { duration: opening ? 420 : 320, easing: 'cubic-bezier(0.32, 0.72, 0, 1)' });
      anim.onfinish = () => {
        anim = null;
        if (!opening) item.open = false;
        item.classList.remove('is-opening', 'is-closing');
        item.style.overflow = '';
      };
    };

    on(summary, 'click', (e: MouseEvent) => {
      e.preventDefault();
      const from = item.offsetHeight;
      anim?.cancel();
      anim = null;
      const closing = item.open && !item.classList.contains('is-closing');
      if (closing) {
        const borders = item.offsetHeight - item.clientHeight;
        run(from, summary.offsetHeight + borders, false);
      } else {
        item.open = true;
        run(from, item.offsetHeight, true);
      }
    });
  });
}

function setupForm() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  if (!form) return;
  const status = form.querySelector<HTMLElement>('[data-form-status]')!;
  // Aktuell ohne Server-Versand: Das Formular öffnet das E-Mail-Programm mit der fertigen Nachricht.
  on(form, 'submit', (e: SubmitEvent) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    if (data.get('website')) return; // Honeypot
    const subject = encodeURIComponent(`${form.dataset.subject} ${data.get('name')}`);
    const body = encodeURIComponent(`${data.get('message')}\n\n${data.get('name')}\n${data.get('email')}`);
    window.location.href = `mailto:${form.dataset.mail}?subject=${subject}&body=${body}`;
    status.dataset.state = 'ok';
    status.textContent = form.dataset.done ?? '';
  });
}

setupHeader();
setupHero();
setupReveals();
setupCounters();
setupMagnetic();
setupTilt();
setupCursor();
setupFaq();
setupForm();
