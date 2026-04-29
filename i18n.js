(function () {
  const STORAGE_KEY = 'portfolio-lang';
  const DEFAULT_LANG = 'en';
  const SUPPORTED = ['en', 'fr'];

  function getByPath(obj, path) {
    return path.split('.').reduce(function (acc, part) {
      return acc != null && acc[part] !== undefined ? acc[part] : undefined;
    }, obj);
  }

  function normalizeLang(lang) {
    if (!lang) return DEFAULT_LANG;
    var base = String(lang).toLowerCase().slice(0, 2);
    return SUPPORTED.indexOf(base) !== -1 ? base : DEFAULT_LANG;
  }

  function preferredLang() {
    var stored = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (stored && SUPPORTED.indexOf(stored) !== -1) return stored;
    var nav = navigator.language || navigator.userLanguage || '';
    return normalizeLang(nav);
  }

  function apply(dict) {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (!key) return;
      var val = getByPath(dict, key);
      if (val !== undefined && val !== null) el.textContent = String(val);
    });

    document.querySelectorAll('[data-i18n-list]').forEach(function (ul) {
      var key = ul.getAttribute('data-i18n-list');
      if (!key) return;
      var arr = getByPath(dict, key);
      if (!Array.isArray(arr)) return;
      var lis = ul.children;
      for (var i = 0; i < arr.length && i < lis.length; i++) {
        if (lis[i].tagName === 'LI') lis[i].textContent = String(arr[i]);
      }
    });

    var code = getByPath(dict, 'meta.htmlLang');
    if (code) document.documentElement.lang = String(code);
  }

  async function load(lang) {
    var l = normalizeLang(lang);
    var res = await fetch('locales/' + l + '.json');
    if (!res.ok) throw new Error('Could not load locales/' + l + '.json');
    return res.json();
  }

  function otherLang(l) {
    l = normalizeLang(l);
    return l === 'en' ? 'fr' : 'en';
  }

  function syncLangToggle(lang) {
    var l = normalizeLang(lang);
    var next = otherLang(l);
    document.querySelectorAll('[data-i18n-switch]').forEach(function (el) {
      el.textContent = next.toUpperCase();
      el.setAttribute('data-lang-next', next);
      el.setAttribute('aria-label', l === 'en' ? 'Switch to French' : 'Switch to English');
    });
  }

  async function setLang(lang) {
    var l = normalizeLang(lang);
    var dict = await load(l);
    apply(dict);
    localStorage.setItem(STORAGE_KEY, l);
    syncLangToggle(l);
    document.dispatchEvent(new CustomEvent('i18n:lang', { detail: { lang: l } }));
    return l;
  }

  function bindSwitcher(root) {
    root = root || document;
    root.querySelectorAll('[data-i18n-switch]').forEach(function (el) {
      if (el.getAttribute('data-i18n-switch-bound') === '1') return;
      el.setAttribute('data-i18n-switch-bound', '1');
      function go() {
        var next = el.getAttribute('data-lang-next');
        if (!next) next = otherLang(preferredLang());
        setLang(next).catch(function (e) {
          console.error(e);
        });
      }
      el.addEventListener('click', go);
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      });
    });
  }

  async function init() {
    bindSwitcher();
    await setLang(preferredLang());
  }

  window.I18n = {
    init: init,
    setLang: setLang,
    preferredLang: preferredLang,
    SUPPORTED: SUPPORTED.slice(),
  };
})();
