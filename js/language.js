document.addEventListener('DOMContentLoaded', () => {
  const switcher = document.getElementById('languageSwitcher');
  if (!switcher) return;

  // Load default language
  loadLanguage(switcher.value);

  // On change
  switcher.addEventListener('change', () => {
    loadLanguage(switcher.value);
  });
});

function loadLanguage(lang) {
  fetch(`lang/${lang}.json`)
    .then(response => {
      if (!response.ok) throw new Error(`Could not load ${lang}.json`);
      return response.json();
    })
    .then(translations => {
      // Find all elements with data-i18n
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[key]) {
          el.textContent = translations[key];
        }
      });
    })
    .catch(err => console.error('Language load error:', err));
}
