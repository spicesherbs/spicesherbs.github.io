document.addEventListener("DOMContentLoaded", function () {
  const langSelector = document.getElementById("languageSwitcher");
  if (!langSelector) return;

  const savedLang = localStorage.getItem("language") || "en";
  langSelector.value = savedLang;
  loadLanguage(savedLang);

  langSelector.addEventListener("change", function () {
    const lang = this.value;
    localStorage.setItem("language", lang);
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
