
let APOPHIS_PRODUCTS = [];

function normalize(text){
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
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

function filteredProducts(){
  const term = normalize(document.querySelector("#product-search")?.value || "");
  const cat = document.querySelector("#product-category")?.value || "all";
  const brand = document.querySelector("#brand-filter")?.value || "all";
  const price = document.querySelector("#price-filter")?.value || "all";
  const need = document.querySelector("#need-filter")?.value || "all";

  return APOPHIS_PRODUCTS.filter(p => {
    const haystack = normalize([p.name,p.brand,p.category,p.segment,p.priceTier,...(p.searchKeywords || []),...(p.needTags || [])].join(" "));
    const okTerm = !term || haystack.includes(term);
    const okCat = cat === "all" || p.category === cat;
    const okBrand = brand === "all" || p.brand === brand;
    const okPrice = price === "all" || p.priceTier === price;
    const okNeed = need === "all" || (p.needTags || []).includes(need);
    return okTerm && okCat && okBrand && okPrice && okNeed;
  });
}

function renderFilterOptions(){
  const brand = document.querySelector("#brand-filter");
  const need = document.querySelector("#need-filter");
  if(!brand || !need) return;

  const brands = [...new Set(APOPHIS_PRODUCTS.map(p => p.brand).filter(Boolean))].sort();
  const needs = [...new Set(APOPHIS_PRODUCTS.flatMap(p => p.needTags || []))].sort();

  brand.innerHTML = `<option value="all">Todas las marcas</option>` + brands.map(b => `<option value="${b}">${b}</option>`).join("");
  need.innerHTML = `<option value="all">Todas las necesidades</option>` + needs.map(n => `<option value="${n}">${n}</option>`).join("");
}

function renderProductOptions(){
  const selects = ["#product-a","#product-b","#product-c"].map(sel => document.querySelector(sel)).filter(Boolean);
  const options = APOPHIS_PRODUCTS.map(p => `<option value="${p.id}">${productLabel(p)}</option>`).join("");

  selects.forEach(select => select.innerHTML = options);
  if(APOPHIS_PRODUCTS[1]) document.querySelector("#product-b").value = APOPHIS_PRODUCTS[1].id;
  if(APOPHIS_PRODUCTS[2]) document.querySelector("#product-c").value = APOPHIS_PRODUCTS[2].id;
}

function renderSuggestions(product){
  const target = document.querySelector("#suggestions");
  if(!target || !product) return;

  const suggestions = (product.suggestedCompare || []).map(findProduct).filter(Boolean);

  target.innerHTML = suggestions.map(p => `
    <button class="suggestion-chip" type="button" data-suggest="${p.id}">
      Comparar con ${p.name}
    </button>
  `).join("");

  target.querySelectorAll("[data-suggest]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelector("#product-b").value = btn.dataset.suggest;
      renderComparison();
    });
  });
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
            <img src="${p.image}" alt="${p.name}" onerror="this.closest('.real-product-image').classList.add('image-error')">
          </div>
          <div class="real-product-body">
            <span class="card-kicker">${p.brand} · ${p.category} · ${p.priceTier}</span>
            <h3>${p.name}</h3>
            <p><strong>Segmento:</strong> ${p.segment}</p>
            <p><strong>Precio/ref.:</strong> ${p.priceReference}</p>
            <a class="ap-btn ap-btn-small" target="_blank" rel="noopener" href="${p.sourceUrl}">Ver fuente</a>
          </div>
        </article>
      `).join("")}
    </div>

    <div class="comparison-table-wrapper technical-table">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Dato</th>
            ${unique.map(p => `<th>${p.name}</th>`).join("")}
          </tr>
        </thead>
        <tbody>
          <tr><td>Marca</td>${unique.map(p => `<td>${p.brand}</td>`).join("")}</tr>
          <tr><td>Categoría</td>${unique.map(p => `<td>${p.category}</td>`).join("")}</tr>
          <tr><td>Segmento</td>${unique.map(p => `<td>${p.segment}</td>`).join("")}</tr>
          <tr><td>Rango precio</td>${unique.map(p => `<td>${p.priceTier}</td>`).join("")}</tr>
          <tr><td>Precio/ref.</td>${unique.map(p => `<td>${p.priceReference}</td>`).join("")}</tr>
          ${specKeys.map(key => `
            <tr>
              <td>${key}</td>
              ${unique.map(p => `<td>${p.specs?.[key] || "—"}</td>`).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>

    <section class="verdict-box">
      <span class="eyebrow">Lectura Apophis</span>
      <h2>Cómo elegir entre estos productos</h2>
      <p>
        Si el presupuesto manda, priorizá precio total, mantenimiento y disponibilidad. 
        Si buscás lujo, mirá calidad percibida, garantía, equipamiento e imagen. 
        Si buscás practicidad, ganan repuestos, cercanía, consumo y uso diario.
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
      <h3>${p.name}</h3>
      <p>${p.brand} · ${p.segment}</p>
      <p><strong>Rango:</strong> ${p.priceTier}</p>
      <p><strong>Precio/ref.:</strong> ${p.priceReference}</p>
      <div class="admin-actions">
        <button type="button" data-set-a="${p.id}">Producto A</button>
        <button type="button" data-set-b="${p.id}">Producto B</button>
        <button type="button" data-set-c="${p.id}">Producto C</button>
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

async function initComparator(){
  const response = await fetch("./data/product-specs.json", { cache:"no-store" });
  APOPHIS_PRODUCTS = await response.json();

  renderFilterOptions();
  renderProductOptions();
  bindControls();
  renderProductSearch();
  renderComparison();
}

document.addEventListener("DOMContentLoaded", initComparator);
