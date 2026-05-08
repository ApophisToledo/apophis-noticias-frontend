async function fetchProductSpecs(){
  const paths = ["../data/product-specs.json", "./data/product-specs.json", "/data/product-specs.json"];
  let lastError = null;
  for(const path of paths){
    try{
      const response = await fetch(path, { cache:"no-store" });
      if(response.ok) return await response.json();
      lastError = new Error(`No se pudo cargar ${path}: ${response.status}`);
    }catch(error){
      lastError = error;
    }
  }
  throw lastError || new Error("No se pudo cargar product-specs.json");
}

function escapeProductHTML(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeProductURL(value){
  const raw = String(value || "").trim();
  if(raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/") || raw.startsWith("../") || raw.startsWith("./")) return raw;
  return "#";
}

function formatProductPrice(product){
  if(typeof product.price === "number" && product.price > 0){
    return new Intl.NumberFormat("es-AR", {
      style:"currency",
      currency:product.currency || "ARS",
      maximumFractionDigits:0
    }).format(product.price);
  }
  return product.priceLabel || product.priceReference || "Consultar precio vigente";
}

async function loadProductSpecs(){
  const boxes = document.querySelectorAll("[data-product-specs]");
  if(!boxes.length) return;

  const products = await fetchProductSpecs();

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
                <img src="${escapeProductHTML(safeProductURL(p.image))}" alt="${escapeProductHTML(p.name)}" onerror="this.closest('.real-product-image').classList.add('image-error')">
              </div>
              <div class="real-product-body">
                <span class="card-kicker">${escapeProductHTML(p.brand)} · ${escapeProductHTML(p.segment)}</span>
                <h3>${escapeProductHTML(p.name)}</h3>
                <p><strong>Precio actual/ref.:</strong> ${escapeProductHTML(formatProductPrice(p))}</p>
                <p><strong>Fecha precio:</strong> ${escapeProductHTML(p.priceDate || "A verificar")}</p>
                <a class="ap-btn ap-btn-small" href="${escapeProductHTML(safeProductURL(p.sourceUrl))}" target="_blank" rel="noopener">Ver fuente / imagen real</a>
              </div>
            </article>
          `).join("")}
        </div>

        <div class="comparison-table-wrapper technical-table">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Dato</th>
                ${selected.map(p => `<th>${escapeProductHTML(p.name)}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${specKeys.map(key => `
                <tr>
                  <td>${escapeProductHTML(key)}</td>
                  ${selected.map(p => `<td>${escapeProductHTML((p.specs && p.specs[key]) ? p.specs[key] : "—")}</td>`).join("")}
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
