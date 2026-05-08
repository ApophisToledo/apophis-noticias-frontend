let APOPHIS_PRODUCTS = [];

function normalize(text){
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeHTML(value){
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeURL(value){
  const raw = String(value || "").trim();
  if(raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/") || raw.startsWith("../") || raw.startsWith("./")) return raw;
  return "#";
}

function productLabel(product){
  return `${product.name} · ${product.brand} · ${product.segment}`;
}

function findProduct(id){
  return APOPHIS_PRODUCTS.find(p => p.id === id);
}

function getSpecKeys(products){
  return Array.from(new Set(products.flatMap(p => Object.keys(p.specs || {}))));
}

function formatPrice(product){
  if(typeof product.price === "number" && product.price > 0){
    return new Intl.NumberFormat("es-AR", {
      style:"currency",
      currency:product.currency || "ARS",
      maximumFractionDigits:0
    }).format(product.price);
  }
  return product.priceLabel || product.priceReference || "Consultar precio vigente";
}

function filteredProducts(){
  const term = normalize(document.querySelector("#product-search")?.value || "");
  const cat = document.querySelector("#product-category")?.value || "all";
  const brand = document.querySelector("#brand-filter")?.value || "all";
  const price = document.querySelector("#price-filter")?.value || "all";
  const need = document.querySelector("#need-filter")?.value || "all";

  return APOPHIS_PRODUCTS.filter(p => {
    const haystack = normalize([
      p.name,
      p.brand,
      p.category,
      p.segment,
      p.priceTier,
      p.priceLabel,
      ...(p.searchKeywords || []),
      ...(p.needTags || []),
      ...(p.motoTags || [])
    ].join(" "));
    const okTerm = !term || haystack.includes(term);
    const okCat = cat === "all" || p.category === cat;
    const okBrand = brand === "all" || p.brand === brand;
    const okPrice = price === "all" || p.priceTier === price;
    const okNeed = need === "all" || (p.needTags || []).includes(need) || (p.motoTags || []).includes(need);
    return okTerm && okCat && okBrand && okPrice && okNeed;
  });
}

function renderFilterOptions(){
  const brand = document.querySelector("#brand-filter");
  const need = document.querySelector("#need-filter");
  if(!brand || !need) return;

  const brands = [...new Set(APOPHIS_PRODUCTS.map(p => p.brand).filter(Boolean))].sort();
  const needs = [...new Set(APOPHIS_PRODUCTS.flatMap(p => [...(p.needTags || []), ...(p.motoTags || [])]))].sort();

  brand.innerHTML = `<option value="all">Todas las marcas</option>` + brands.map(b => `<option value="${escapeHTML(b)}">${escapeHTML(b)}</option>`).join("");
  need.innerHTML = `<option value="all">Todas las necesidades</option>` + needs.map(n => `<option value="${escapeHTML(n)}">${escapeHTML(n)}</option>`).join("");
}

function renderProductOptions(){
  const selects = ["#product-a","#product-b","#product-c"].map(sel => document.querySelector(sel)).filter(Boolean);
  const options = APOPHIS_PRODUCTS.map(p => `<option value="${escapeHTML(p.id)}">${escapeHTML(productLabel(p))}</option>`).join("");

  selects.forEach(select => select.innerHTML = options);
  const params = new URLSearchParams(window.location.search);
  const productFromUrl = params.get("product");
  const categoryFromUrl = params.get("category");

  if(categoryFromUrl){
    const catSelect = document.querySelector("#product-category");
    if(catSelect) catSelect.value = categoryFromUrl;
  }

  if(productFromUrl && findProduct(productFromUrl)){
    const a = document.querySelector("#product-a");
    if(a) a.value = productFromUrl;
  }

  if(APOPHIS_PRODUCTS[1] && document.querySelector("#product-b")) document.querySelector("#product-b").value = APOPHIS_PRODUCTS[1].id;
  if(APOPHIS_PRODUCTS[2] && document.querySelector("#product-c")) document.querySelector("#product-c").value = APOPHIS_PRODUCTS[2].id;
}

function renderSuggestions(product){
  const target = document.querySelector("#suggestions");
  if(!target || !product) return;

  const suggestions = (product.suggestedCompare || []).map(findProduct).filter(Boolean);

  target.innerHTML = suggestions.map(p => `
    <button class="suggestion-chip" type="button" data-suggest="${escapeHTML(p.id)}">
      Comparar con ${escapeHTML(p.name)}
    </button>
  `).join("");

  target.querySelectorAll("[data-suggest]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector("#product-b").value = btn.dataset.suggest;
      renderComparison();
    });
  });
}

function extraMotoRows(products){
  if(!products.some(p => p.category === "motos")) return "";
  return `
    <tr><td>Cilindrada</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.displacementCc ? `${p.motoSpecs.displacementCc} cc` : "—")}</td>`).join("")}</tr>
    <tr><td>Consumo estimado</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.consumptionEstimate || "—")}</td>`).join("")}</tr>
    <tr><td>Velocidad final estimada</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.speedEstimate || "—")}</td>`).join("")}</tr>
    <tr><td>Ciudad</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.cityScore ? `${p.motoSpecs.cityScore}/10` : "—")}</td>`).join("")}</tr>
    <tr><td>Trabajo</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.workScore ? `${p.motoSpecs.workScore}/10` : "—")}</td>`).join("")}</tr>
    <tr><td>Ruta</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.routeScore ? `${p.motoSpecs.routeScore}/10` : "—")}</td>`).join("")}</tr>
    <tr><td>Veredicto moto</td>${products.map(p => `<td>${escapeHTML(p.motoSpecs?.finalVerdict || "—")}</td>`).join("")}</tr>
  `;
}

function renderComparison(){
  const selected = ["#product-a","#product-b","#product-c"]
    .map(sel => findProduct(document.querySelector(sel)?.value))
    .filter(Boolean);

  const output = document.querySelector("#comparison-output");
  if(!selected.length || !output) return;

  const unique = [];
  selected.forEach(p => {
    if(!unique.find(x => x.id === p.id)) unique.push(p);
  });

  const specKeys = getSpecKeys(unique);

  output.innerHTML = `
    <div class="real-product-grid three-products">
      ${unique.map(p => `
        <article class="real-product-card">
          <div class="real-product-image">
            <img src="${escapeHTML(safeURL(p.image))}" alt="${escapeHTML(p.name)}" onerror="this.closest('.real-product-image').classList.add('image-error')">
          </div>
          <div class="real-product-body">
            <span class="card-kicker">${escapeHTML(p.brand)} · ${escapeHTML(p.category)} · ${escapeHTML(p.priceTier)}</span>
            <h3>${escapeHTML(p.name)}</h3>
            <p><strong>Segmento:</strong> ${escapeHTML(p.segment)}</p>
            <p><strong>Precio/ref.:</strong> ${escapeHTML(formatPrice(p))}</p>
            <p><strong>Fecha:</strong> ${escapeHTML(p.priceDate || "A verificar")}</p>
            <a class="ap-btn ap-btn-small" target="_blank" rel="noopener" href="${escapeHTML(safeURL(p.sourceUrl))}">Ver fuente</a>
          </div>
        </article>
      `).join("")}
    </div>

    <div class="comparison-table-wrapper technical-table">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Dato</th>
            ${unique.map(p => `<th>${escapeHTML(p.name)}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr><td>Marca</td>${unique.map(p => `<td>${escapeHTML(p.brand)}</td>`).join("")}</tr>
          <tr><td>Categoría</td>${unique.map(p => `<td>${escapeHTML(p.category)}</td>`).join("")}</tr>
          <tr><td>Segmento</td>${unique.map(p => `<td>${escapeHTML(p.segment)}</td>`).join("")}</tr>
          <tr><td>Rango precio</td>${unique.map(p => `<td>${escapeHTML(p.priceTier)}</td>`).join("")}</tr>
          <tr><td>Precio normalizado</td>${unique.map(p => `<td>${escapeHTML(formatPrice(p))}</td>`).join("")}</tr>
          <tr><td>Fuente precio</td>${unique.map(p => `<td>${escapeHTML(p.priceSource || "—")}</td>`).join("")}</tr>
          ${extraMotoRows(unique)}
          ${specKeys.map(key => `
            <tr>
              <td>${escapeHTML(key)}</td>
              ${unique.map(p => `<td>${escapeHTML(p.specs?.[key] || "—")}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <section class="verdict-box">
      <span class="eyebrow">Lectura Apophis</span>
      <h2>Cómo elegir entre estos productos</h2>
      <p>
        En motos, no alcanza con mirar cilindrada: compará precio final, consumo, service, repuestos, reventa, seguridad, frenos y uso real. 
        Para ciudad gana la practicidad; para ruta importan potencia sostenida, estabilidad y frenos; para trabajo mandan consumo y mantenimiento.
      </p>
    </section>
  `;

  renderSuggestions(unique[0]);
}

function renderProductSearch(){
  const list = document.querySelector("#product-results");
  if(!list) return;

  const filtered = filteredProducts();

  list.innerHTML = filtered.map(p => `
    <article class="ap-card product-search-card">
      <h3>${escapeHTML(p.name)}</h3>
      <p>${escapeHTML(p.brand)} · ${escapeHTML(p.segment)}</p>
      <p><strong>Rango:</strong> ${escapeHTML(p.priceTier)}</p>
      <p><strong>Precio/ref.:</strong> ${escapeHTML(formatPrice(p))}</p>
      <div class="admin-actions">
        <button type="button" data-set-a="${escapeHTML(p.id)}">Producto A</button>
        <button type="button" data-set-b="${escapeHTML(p.id)}">Producto B</button>
        <button type="button" data-set-c="${escapeHTML(p.id)}">Producto C</button>
      </div>
    </article>
  `).join("");

  list.querySelectorAll("[data-set-a]").forEach(btn => btn.addEventListener("click", () => { document.querySelector("#product-a").value = btn.dataset.setA; renderComparison(); }));
  list.querySelectorAll("[data-set-b]").forEach(btn => btn.addEventListener("click", () => { document.querySelector("#product-b").value = btn.dataset.setB; renderComparison(); }));
  list.querySelectorAll("[data-set-c]").forEach(btn => btn.addEventListener("click", () => { document.querySelector("#product-c").value = btn.dataset.setC; renderComparison(); }));
}

function bindControls(){
  ["#product-search","#product-category","#brand-filter","#price-filter","#need-filter"].forEach(sel => {
    const el = document.querySelector(sel);
    if(el) el.addEventListener("input", renderProductSearch);
    if(el) el.addEventListener("change", renderProductSearch);
  });

  ["#product-a","#product-b","#product-c"].forEach(sel => {
    const el = document.querySelector(sel);
    if(el) el.addEventListener("change", renderComparison);
  });
}

async function fetchProducts(){
  const paths = ["./data/product-specs.json", "/data/product-specs.json", "../data/product-specs.json"];
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

async function initComparator(){
  APOPHIS_PRODUCTS = await fetchProducts();

  renderFilterOptions();
  renderProductOptions();
  bindControls();
  renderProductSearch();
  renderComparison();
}

document.addEventListener("DOMContentLoaded", initComparator);
