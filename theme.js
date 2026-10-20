// Dark-/Light-Mode umschalten (Startwert wird schon im <head> gesetzt)
(() => {
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const read = () => { try { return localStorage.getItem('theme'); } catch (e) { return null; } };
  const save = v => { try { localStorage.setItem('theme', v); } catch (e) { /* ignore */ } };

  const apply = theme => {
    root.dataset.theme = theme;
    document.querySelectorAll('.theme-toggle').forEach(btn => {
      const dark = theme === 'dark';
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren');
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0E0E0F' : '#F6F5F2';
  };

  apply(root.dataset.theme || (media.matches ? 'dark' : 'light'));

  document.querySelectorAll('.theme-toggle').forEach(btn => btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
    save(next);
  }));

  // Systemeinstellung folgen, solange nichts manuell gewählt wurde
  media.addEventListener('change', e => { if (!read()) apply(e.matches ? 'dark' : 'light'); });
})();
