document.addEventListener("DOMContentLoaded", function () {
  const langSelector = document.getElementById("languageSwitcher");
  if (!langSelector) return;

  const savedLang = localStorage.getItem("lang") || "en"; // unified key
  langSelector.value = savedLang;
  loadLanguage(savedLang);

  langSelector.addEventListener("change", function () {
    const lang = this.value;
    localStorage.setItem("lang", lang); // unified key
    loadLanguage(lang);
  });

  function loadLanguage(lang) {
    fetch(`lang/${lang}.json`)
      .then(res => res.json())
      .then(data => {
        document.querySelectorAll("[data-i18n]").forEach(el => {
          const key = el.getAttribute("data-i18n");
          if (data[key]) el.textContent = data[key];
        });
      });
  }
});
