/**
 * Light / dark theme: sets data-theme on <html>, persists in localStorage.
 * Load this script in <head> before index.css to avoid a flash of wrong colors.
 */
(function () {
  var KEY = 'portfolio-theme';

  function pick() {
    var s = localStorage.getItem(KEY);
    if (s === 'light' || s === 'dark') return s;
    if (typeof window.matchMedia === 'function' && matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  }

  function apply(t) {
    t = t === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(KEY, t);
    syncToggle();
  }

  function syncToggle() {
    var t = document.documentElement.getAttribute('data-theme') || 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
      el.textContent = t === 'dark' ? 'Light' : 'Dark';
      el.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function bind() {
    document.querySelectorAll('[data-theme-toggle]').forEach(function (el) {
      if (el.getAttribute('data-theme-toggle-bound') === '1') return;
      el.setAttribute('data-theme-toggle-bound', '1');
      function flip() {
        var cur = document.documentElement.getAttribute('data-theme') || 'dark';
        apply(cur === 'dark' ? 'light' : 'dark');
      }
      el.addEventListener('click', flip);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          flip();
        }
      });
    });
    syncToggle();
  }

  document.documentElement.setAttribute('data-theme', pick());

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  window.Theme = {
    apply: apply,
    syncToggle: syncToggle,
  };
})();
