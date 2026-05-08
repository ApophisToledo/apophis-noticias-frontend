
async function loadProductSpecs(){
  const boxes = document.querySelectorAll("[data-product-specs]");
  if(!boxes.length) return;

  const response = await fetch("../data/product-specs.json", { cache:"no-store" });
  const products = await response.json();

  boxes.forEach(box => {
    const category = box.dataset.category;
    const ids = (box.dataset.productSpecs || "").split(",").map(x => x.trim()).filter(Boolean);

    let selected = ids.length
      ? products.filter(p => ids.includes(p.id))
      : products.filter(p => p.category === category);

    if(!selected.length) return;

    const specKeys = Array.from(new Set(selected.flatMap(p => Object.keys(p.specs || {}))));

    box.innerHTML = `
      <section class="product-real-section">
        <div class="section-head">
          <span class="eyebrow">Ficha técnica comparada</span>
          <h2>Datos técnicos, precios e imágenes reales</h2>
          <p>Los valores son referencias públicas auditadas. Pueden cambiar por fecha, stock, versión, financiación y zona.</p>
        </div>

        <div class="real-product-grid">
          ${selected.map(p => `
            <article class="real-product-card">
              <div class="real-product-image">
                <img src="${p.image}" alt="${p.name}" onerror="this.closest('.real-product-image').classList.add('image-error')">
              </div>
              <div class="real-product-body">
                <span class="card-kicker">${p.brand} · ${p.segment}</span>
                <h3>${p.name}</h3>
                <p><strong>Precio actual/ref.:</strong> ${p.priceReference}</p>
                <a class="ap-btn ap-btn-small" href="${p.sourceUrl}" target="_blank" rel="noopener">Ver fuente / imagen real</a>
              </div>
            </article>
          `).join("")}
        </div>

        <div class="comparison-table-wrapper technical-table">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Dato</th>
                ${selected.map(p => `<th>${p.name}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${specKeys.map(key => `
                <tr>
                  <td>${key}</td>
                  ${selected.map(p => `<td>${(p.specs && p.specs[key]) ? p.specs[key] : "—"}</td>`).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </section>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadProductSpecs);
