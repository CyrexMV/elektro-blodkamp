// Navigation: Hintergrund beim Scrollen + mobiles Menü
const nav = document.querySelector('.nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');

const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

if (toggle) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

// Aktiven Abschnitt in der Navigation markieren
const spyLinks = [...document.querySelectorAll('.nav__links a[href^="#"]')];
const spySections = spyLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if (spySections.length) {
  const markActive = () => {
    const y = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    spySections.forEach(sec => { if (sec.offsetTop <= y) current = sec; });
    spyLinks.forEach(a => a.classList.toggle('is-active', !!current && a.getAttribute('href') === '#' + current.id));
  };
  window.addEventListener('scroll', markActive, { passive: true });
  markActive();
}

// Scroll-Animationen
const revealTargets = document.querySelectorAll('.reveal, .bolt-line');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

// Elektro-Check
const checkList = document.getElementById('checkList');
if (checkList) {
  const items = [...checkList.querySelectorAll('li')];
  const answers = new Array(items.length).fill(null);
  const result = document.getElementById('checkResult');
  const title = document.getElementById('resultTitle');
  const text = document.getElementById('resultText');
  const cta = document.getElementById('resultCta');
  const fill = document.getElementById('meterFill');

  const verdicts = [
    { max: 0, cls: 'is-ok', title: 'Alles im grünen Bereich', text: 'Ihre Elektrik scheint gut aufgestellt. Für Erweiterungen oder Fragen sind wir trotzdem gern für Sie da.' },
    { max: 2, cls: 'is-mid', title: 'Ein Check lohnt sich', text: 'Einige Punkte deuten darauf hin, dass sich eine Überprüfung oder Modernisierung lohnen kann. Wir beraten Sie gern.' },
    { max: Infinity, cls: 'is-high', title: 'Wir sollten uns das ansehen', text: 'Mehrere Punkte sprechen für eine fachliche Überprüfung – für Ihre Sicherheit und für zukünftige Anforderungen.' }
  ];

  const update = () => {
    const done = answers.filter(a => a !== null);
    const score = done.reduce((s, a) => s + a, 0);
    fill.style.left = `${(score / items.length) * 100}%`;
    result.classList.remove('is-ok', 'is-mid', 'is-high');

    if (done.length < items.length) {
      title.textContent = 'Beantworten Sie alle Fragen';
      const open = items.length - done.length;
      text.innerHTML = `Noch <strong>${open}</strong> ${open === 1 ? 'Frage' : 'Fragen'} offen.`;
      cta.hidden = true;
      return;
    }
    const v = verdicts.find(v => score <= v.max);
    result.classList.add(v.cls);
    title.textContent = v.title;
    text.textContent = v.text;
    cta.hidden = false;
  };

  items.forEach((li, i) => {
    li.querySelectorAll('button').forEach(btn => {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        li.querySelectorAll('button').forEach(b => { b.classList.remove('is-on'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-on');
        btn.setAttribute('aria-pressed', 'true');
        answers[i] = Number(btn.dataset.v);
        update();
      });
    });
  });

  // Ergebnis ins Kontaktformular übernehmen
  cta.addEventListener('click', () => {
    const msg = document.getElementById('message');
    const yes = items.filter((_, i) => answers[i] === 1).map(li => '- ' + li.querySelector('span').textContent);
    if (msg && !msg.value.trim()) {
      msg.value = yes.length
        ? `Ich habe den Elektro-Check gemacht und bitte um Beratung. Zutreffend:\n${yes.join('\n')}`
        : 'Ich habe den Elektro-Check gemacht und hätte gern eine Beratung.';
    }
  });
}

// FAQ-Seite: Suche + Kategorien
const faqSearch = document.getElementById('faqSearch');
if (faqSearch) {
  const groups = [...document.querySelectorAll('.faq-group')];
  const cats = [...document.querySelectorAll('.faq-cats button')];
  const empty = document.getElementById('faqEmpty');
  let activeCat = 'all';

  const filter = () => {
    const q = faqSearch.value.trim().toLowerCase();
    let total = 0;
    groups.forEach(group => {
      const inCat = activeCat === 'all' || group.dataset.cat === activeCat;
      let visible = 0;
      group.querySelectorAll('details').forEach(d => {
        const match = inCat && (!q || d.textContent.toLowerCase().includes(q));
        d.hidden = !match;
        if (q && match) d.open = true;
        if (match) visible++;
      });
      group.hidden = visible === 0;
      total += visible;
    });
    empty.hidden = total > 0;
  };

  faqSearch.addEventListener('input', filter);
  cats.forEach(btn => btn.addEventListener('click', () => {
    cats.forEach(b => b.classList.toggle('is-on', b === btn));
    activeCat = btn.dataset.cat;
    filter();
  }));
}

// Kontaktformular -> vorbereitete E-Mail
const form = document.getElementById('contactForm');
if (form) {
  const error = document.getElementById('formError');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const message = (data.get('message') || '').trim();

    form.querySelectorAll('.field').forEach(f => f.classList.remove('is-invalid'));
    const missing = [];
    if (!name) { missing.push('Name'); form.name.closest('.field').classList.add('is-invalid'); }
    if (!message) { missing.push('Anliegen'); form.message.closest('.field').classList.add('is-invalid'); }
    if (missing.length) { error.textContent = `Bitte ausfüllen: ${missing.join(', ')}.`; return; }
    if (!form.querySelector('#consent').checked) { error.textContent = 'Bitte stimmen Sie der Datenschutzerklärung zu.'; return; }
    error.textContent = '';

    const subject = `Anfrage ${data.get('bereich')} – ${name}`;
    const body = [
      `Bereich: ${data.get('bereich')}`,
      `Name: ${name}`,
      `Telefon: ${data.get('phone') || '-'}`,
      `Ort: ${data.get('ort') || '-'}`,
      '',
      message
    ].join('\n');
    window.location.href = `mailto:info@elektro-blodkamp.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
