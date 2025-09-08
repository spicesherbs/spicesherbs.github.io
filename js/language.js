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
    if (cache[lang]) return cache[lang];

    const staticRes = await fetch("lang/static.json");
    const staticData = staticRes.ok ? await staticRes.json() : {};

    const langRes = await fetch(`lang/${lang}.json`);
    if (!langRes.ok) throw new Error(`Missing lang file: ${lang}`);
    const langData = await langRes.json();

    const merged = { ...langData, ...staticData };
    cache[lang] = merged;
    return merged;
  }

  function applyTo(el) {
    const key = el.getAttribute("data-i18n");
    if (!key || !dict) return;

    const attrList = (el.getAttribute("data-i18n-attr") || "")
      .split("|")
      .map((s) => s.trim())
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

  // ✅ Hide broken images
  function attachImageErrorHandler(img) {
    if (!img) return;
    img.addEventListener("error", () => {
      img.style.display = "none";
    });
    // If already broken
    if (img.complete && img.naturalWidth === 0) {
      img.style.display = "none";
    }
  }

  function checkAllImages(root = document) {
    root.querySelectorAll("img").forEach(attachImageErrorHandler);
  }

  function observeNewNodes() {
    const obs = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((node) => {
            if (!(node instanceof Element)) return;

            // Apply translations
            if (node.hasAttribute && node.hasAttribute("data-i18n")) applyTo(node);
            node.querySelectorAll?.("[data-i18n]").forEach(applyTo);

            // ✅ Handle new <img>
            if (node.tagName === "IMG") {
              attachImageErrorHandler(node);
            }
            node.querySelectorAll?.("img").forEach(attachImageErrorHandler);
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

  async function applyTranslations(lang = currentLang) {
    currentLang = lang || DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, currentLang);
    setHtmlLangAttr(currentLang);

    dict = await fetchDict(currentLang);
    applyToDocument();
  }

  window.applyTranslations = applyTranslations;
  window.getCurrentLang = () => currentLang;

  document.addEventListener("DOMContentLoaded", async () => {
    const selector = document.getElementById("languageSwitcher");
    if (selector) {
      selector.value = currentLang;
      selector.addEventListener("change", (e) => {
        applyTranslations(e.target.value);
      });
    }
    await applyTranslations(currentLang);
    observeNewNodes();

    // ✅ Run once on all existing images
    checkAllImages();
  });
})();
