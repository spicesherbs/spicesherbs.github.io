// language.js
(() => {
  const STORAGE_KEY = "lang";
  const DEFAULT_LANG = "en";

  let currentLang =
    localStorage.getItem(STORAGE_KEY) ||
    (navigator.language ? navigator.language.slice(0, 2) : DEFAULT_LANG) ||
    DEFAULT_LANG;

  const cache = {};
  let dict = null;

  function setHtmlLangAttr(lang) {
    try {
      document.documentElement.setAttribute("lang", lang);
    } catch (_) {}
  }

  async function fetchDict(lang) {
    // Return from cache if available
    if (cache[lang]) return cache[lang];

    // Always load static.json (non-translatable)
    const staticRes = await fetch("lang/static.json");
    const staticData = staticRes.ok ? await staticRes.json() : {};

    // Load language file
    const langRes = await fetch(`lang/${lang}.json`);
    if (!langRes.ok) throw new Error(`Missing lang file: ${lang}`);
    const langData = await langRes.json();

    // Merge: staticData takes priority (cannot be overridden)
    const merged = { ...langData, ...staticData };

    cache[lang] = merged;
    return merged;
  }

  function applyTo(el) {
    const key = el.getAttribute("data-i18n");
    if (!key || !dict) return;

    // Support textContent by default.
    // If you need attribute translations, add data-i18n-attr="placeholder|title" etc.
    const attrList = (el.getAttribute("data-i18n-attr") || "")
      .split("|")
      .map(s => s.trim())
      .filter(Boolean);

    if (attrList.length > 0) {
      attrList.forEach((attr) => {
        if (dict[key] != null) el.setAttribute(attr, String(dict[key]));
      });
    } else {
      if (dict[key] != null) el.textContent = String(dict[key]);
    }
  }

  function applyToDocument() {
    document.querySelectorAll("[data-i18n]").forEach(applyTo);
  }

  // Observe new nodes so translations also apply after products render
  function observeNewNodes() {
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;
            if (node.hasAttribute && node.hasAttribute("data-i18n")) applyTo(node);
            node.querySelectorAll?.("[data-i18n]").forEach(applyTo);
          });
        } else if (m.type === "attributes" && m.attributeName === "data-i18n") {
          applyTo(m.target);
        }
      }
    });
    obs.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-i18n"],
    });
  }

  // Public: products.js can call this reliably
  async function applyTranslations(lang = currentLang) {
    currentLang = lang || DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, currentLang);
    setHtmlLangAttr(currentLang);

    dict = await fetchDict(currentLang);
    applyToDocument();
  }

  // Expose globals BEFORE DOMContentLoaded so other scripts can call them
  window.applyTranslations = applyTranslations;
  window.getCurrentLang = () => currentLang;

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", async () => {
    const selector = document.getElementById("languageSwitcher");
    if (selector) {
      selector.value = currentLang;
      selector.addEventListener("change", (e) => {
        applyTranslations(e.target.value);
      });
    }
    await applyTranslations(currentLang); // apply immediately on load
    observeNewNodes();                    // keep applying to newly added nodes
        //  Hide broken testimonial images
    document.querySelectorAll(".client_img-box img").forEach((img) => {
      img.onerror = () => {
        img.style.display = "none";
      };
    });
    
  });
})();


