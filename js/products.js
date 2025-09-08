async function renderProducts(category, containerId) {
  try {
    const response = await fetch("products.json");
    const data = await response.json();

    const container = document.getElementById(containerId);
    if (!container) return; // Exit if the container is not found on this page

    container.innerHTML = "";

    data[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";

      // Create img in JS so we can attach onerror before appending
      const img = document.createElement("img");
      img.src = product.image;
      img.alt = product.title;
      img.className = "mx-auto d-block";
      img.style.width = "100px";

      img.onerror = () => {
        img.style.display = "none"; // ✅ hide broken images
      };

      card.innerHTML = `
        <div class="card h-100 border text-center p-3">
          <div class="img-holder"></div>
          <div class="card-body">
            <h3 class="card-title mt-3" data-i18n="${product.id}_title">${product.title}</h3>
            <p class="card-text mt-3 mb-4" data-i18n="${product.id}_desc">${product.description}</p>
            <a href="mailto:order@uyufoods.com?subject=Enquiry about ${product.title}" 
               class="custom_orange-btn" data-i18n="buy_now">Order Now</a>
          </div>
        </div>
      `;

      // Insert image into the placeholder
      card.querySelector(".img-holder").appendChild(img);

      container.appendChild(card);
    });

    // Detect saved or browser language
    const savedLang = localStorage.getItem("lang");

    let langToUse = "en"; // default fallback
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
