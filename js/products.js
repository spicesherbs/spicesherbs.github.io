async function renderProducts(category, containerId) {
  try {
    const response = await fetch("products.json");
    const data = await response.json();

    const container = document.getElementById(containerId);
    container.innerHTML = "";

    data[category].forEach(product => {
      const card = document.createElement("div");
      card.className = "col-md-6 mb-4";
      card.innerHTML = `
        <div class="card h-100 border text-center p-3">
          <img src="${product.image}" alt="${product.id}" class="mx-auto d-block" style="width:100px;" />
          <div class="card-body">
            <h3 class="card-title mt-3" data-i18n="${product.id}_title">${product.id}</h3>
            <p class="card-text mt-3 mb-4" data-i18n="${product.id}_desc"></p>
            <a href="" class="custom_orange-btn" data-i18n="buy_now">Buy Now</a>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Apply translations after rendering
    if (typeof applyTranslations === "function") {
      applyTranslations(document.documentElement.lang || "en");
    }
  } catch (err) {
    console.error("Error loading products:", err);
  }
}

// Example usage per page:
// renderProducts("spices", "spices-container");
// renderProducts("oils", "oils-container");
// renderProducts("herbs", "herbs-container");
