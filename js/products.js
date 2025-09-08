async function renderProducts(category, containerId) {
  try {
    const response = await fetch("products.json");
    const data = await response.json();

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = "";

    data[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";

      // Create card wrapper
      const cardInner = document.createElement("div");
      cardInner.className = "card h-100 border text-center p-3";

      // ✅ Create image with error handler BEFORE setting src
      const img = document.createElement("img");
      img.className = "mx-auto d-block";
      img.style.width = "100px";
      img.alt = product.title;
      img.onerror = () => {
        img.style.display = "none"; // hide if broken
      };
      img.src = product.image; // set AFTER handler

      // Card body
      const body = document.createElement("div");
      body.className = "card-body";
      body.innerHTML = `
        <h3 class="card-title mt-3" data-i18n="${product.id}_title">${product.title}</h3>
        <p class="card-text mt-3 mb-4" data-i18n="${product.id}_desc">${product.description}</p>
        <a href="mailto:order@uyufoods.com?subject=Enquiry about ${product.title}" 
           class="custom_orange-btn" data-i18n="buy_now">Order Now</a>
      `;

      // Build card
      cardInner.appendChild(img);
      cardInner.appendChild(body);
      card.appendChild(cardInner);
      container.appendChild(card);
    });

    // Detect saved or browser language
    const savedLang = localStorage.getItem("lang");

    let langToUse = "en";
    if (savedLang) {
      langToUse = savedLang;
    } else if (navigator.language) {
      const browserLang = navigator.language.slice(0, 2);
      const supportedLangs = ["en", "de", "es", "fr", "it", "ja", "nl", "pl", "zh"];
      langToUse = supportedLangs.includes(browserLang) ? browserLang : "en";
      localStorage.setItem("lang", langToUse);
    }
    
    if (typeof applyTranslations === "function") {
      applyTranslations(langToUse);
    }

  } catch (err) {
    console.error("Error loading products:", err);
  }
}


// Render based on the page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("spices-container")) {
    renderProducts("spices", "spices-container");
  }
  if (document.getElementById("oils-container")) {
    renderProducts("oils", "oils-container");
  }
  if (document.getElementById("herbs-container")) {
    renderProducts("herbs", "herbs-container");
  }
});
