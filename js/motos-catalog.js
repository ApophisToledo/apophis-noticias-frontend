(function(){
  const DATA_PATHS = ["../data/product-specs.json", "/data/product-specs.json", "./data/product-specs.json"];

  function normalizeText(value){
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function escapeHTML(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeURL(value){
    const raw = String(value || "").trim();
    if(!raw) return "#";
    if(raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("/") || raw.startsWith("../") || raw.startsWith("./")) return raw;
    return "#";
  }

  async function fetchJson(paths){
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
    throw lastError || new Error("No se pudo cargar la base de motos");
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

  function confidenceLabel(product){
    const map = {
      alta:"Dato fuerte",
      media:"Referencia útil",
      baja:"A verificar"
    };
    return map[product.priceConfidence] || "A verificar";
  }

  function scorePill(label, value){
    const safeValue = Number(value || 0);
    return `<span class="moto-score-pill"><strong>${escapeHTML(label)}</strong> ${safeValue}/10</span>`;
  }

  function classifyDisplacement(cc){
    if(cc <= 115) return "Cub / 110cc";
    if(cc <= 160) return "125-160cc";
    if(cc <= 220) return "161-220cc";
    if(cc <= 320) return "221-320cc";
    if(cc <= 380) return "321-380cc";
    if(cc <= 500) return "381-500cc";
    return "500cc+";
  }

  function motoCard(product){
    const moto = product.motoSpecs || {};
    const tags = product.motoTags || product.needTags || [];
    return `
      <article class="moto-complete-card" data-moto-card>
        <div class="moto-complete-image">
          <img src="${escapeHTML(safeURL(product.image))}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.closest('.moto-complete-image').classList.add('image-error')">
        </div>
        <div class="moto-complete-body">
          <span class="card-kicker">${escapeHTML(product.brand)} · ${escapeHTML(product.segment)}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <p class="moto-price"><strong>${escapeHTML(formatPrice(product))}</strong> <small>${escapeHTML(confidenceLabel(product))}</small></p>
          <p>${escapeHTML(moto.finalVerdict || product.specs?.usoIdeal || "Ficha pendiente de completar.")}</p>
          <div class="moto-chip-row">
            ${tags.slice(0,7).map(tag => `<span>${escapeHTML(tag)}</span>`).join("")}
          </div>
          <dl class="moto-spec-list">
            <div><dt>Cilindrada</dt><dd>${escapeHTML(moto.displacementCc ? `${moto.displacementCc} cc` : product.specs?.cilindrada || "—")}</dd></div>
            <div><dt>Caja</dt><dd>${escapeHTML(moto.transmissionSpeeds ? `${moto.transmissionSpeeds} velocidades` : product.specs?.transmision || "—")}</dd></div>
            <div><dt>Consumo</dt><dd>${escapeHTML(moto.consumptionEstimate || "—")}</dd></div>
            <div><dt>Vel. final</dt><dd>${escapeHTML(moto.speedEstimate || "—")}</dd></div>
            <div><dt>Mantenimiento</dt><dd>${escapeHTML(moto.maintenanceLevel || "—")}</dd></div>
            <div><dt>Reventa</dt><dd>${escapeHTML(moto.resaleLevel || "—")}</dd></div>
            <div><dt>ABS</dt><dd>${escapeHTML(moto.abs || "—")}</dd></div>
            <div><dt>Uso ideal</dt><dd>${escapeHTML(moto.idealUse || product.specs?.usoIdeal || "—")}</dd></div>
          </dl>
          <div class="moto-score-row">
            ${scorePill("Ciudad", moto.cityScore)}
            ${scorePill("Trabajo", moto.workScore)}
            ${scorePill("Ruta", moto.routeScore)}
            ${scorePill("Principiante", moto.beginnerScore)}
            ${scorePill("Valor", moto.valueScore)}
          </div>
          <div class="moto-card-actions">
            <a class="ap-btn ap-btn-small" href="../comparador.html?category=motos&product=${encodeURIComponent(product.id)}">Comparar</a>
            <a class="ap-btn ap-btn-small ap-btn-ghost" href="${escapeHTML(safeURL(product.sourceUrl))}" target="_blank" rel="noopener">Fuente</a>
          </div>
        </div>
      </article>
    `;
  }

  function motoRow(product){
    const moto = product.motoSpecs || {};
    return `
      <tr>
        <td><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.brand)}</small></td>
        <td>${escapeHTML(classifyDisplacement(Number(moto.displacementCc || 0)))}</td>
        <td>${escapeHTML(formatPrice(product))}</td>
        <td>${escapeHTML(moto.consumptionEstimate || "—")}</td>
        <td>${escapeHTML(moto.speedEstimate || "—")}</td>
        <td>${escapeHTML(moto.finalVerdict || "—")}</td>
      </tr>
    `;
  }

  function sortProducts(products, mode){
    const list = [...products];
    if(mode === "precio") return list.sort((a,b) => (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER));
    if(mode === "cilindrada") return list.sort((a,b) => (a.motoSpecs?.displacementCc || 0) - (b.motoSpecs?.displacementCc || 0));
    if(mode === "valor") return list.sort((a,b) => (b.motoSpecs?.valueScore || 0) - (a.motoSpecs?.valueScore || 0));
    if(mode === "ciudad") return list.sort((a,b) => (b.motoSpecs?.cityScore || 0) - (a.motoSpecs?.cityScore || 0));
    if(mode === "ruta") return list.sort((a,b) => (b.motoSpecs?.routeScore || 0) - (a.motoSpecs?.routeScore || 0));
    if(mode === "trabajo") return list.sort((a,b) => (b.motoSpecs?.workScore || 0) - (a.motoSpecs?.workScore || 0));
    return list.sort((a,b) => a.brand.localeCompare(b.brand, "es") || a.name.localeCompare(b.name, "es"));
  }

  function filterProducts(products){
    const term = normalizeText(document.querySelector("#moto-search")?.value || "");
    const displacement = document.querySelector("#moto-displacement")?.value || "all";
    const priceStatus = document.querySelector("#moto-price-status")?.value || "all";
    const brand = document.querySelector("#moto-brand")?.value || "all";
    const use = document.querySelector("#moto-use")?.value || "all";

    return products.filter(product => {
      const moto = product.motoSpecs || {};
      const tags = [...(product.motoTags || []), ...(product.needTags || [])];
      const haystack = normalizeText([product.name, product.brand, product.segment, moto.idealUse, moto.finalVerdict, ...tags].join(" "));
      const cc = Number(moto.displacementCc || 0);
      const okTerm = !term || haystack.includes(term);
      const okBrand = brand === "all" || product.brand === brand;
      const okDisplacement = displacement === "all"
        || (displacement === "110" && cc <= 115)
        || (displacement === "150" && cc > 115 && cc <= 160)
        || (displacement === "200" && cc > 160 && cc <= 220)
        || (displacement === "300" && cc > 220 && cc <= 320)
        || (displacement === "350" && cc > 320 && cc <= 380)
        || (displacement === "500" && cc > 380 && cc <= 500)
        || (displacement === "plus" && cc > 500);
      const okPrice = priceStatus === "all" || product.priceStatus === priceStatus;
      const okUse = use === "all" || haystack.includes(normalizeText(use));
      return okTerm && okBrand && okDisplacement && okPrice && okUse;
    });
  }

  function renderStats(products, filtered){
    const stats = document.querySelector("#motos-complete-stats");
    if(!stats) return;
    const brands = new Set(products.map(product => product.brand));
    const withPrice = products.filter(product => typeof product.price === "number" && product.price > 0).length;
    const ccBuckets = filtered.reduce((acc, product) => {
      const label = classifyDisplacement(Number(product.motoSpecs?.displacementCc || 0));
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    const topBucket = Object.entries(ccBuckets).sort((a,b) => b[1] - a[1])[0]?.[0] || "—";
    stats.innerHTML = `
      <div><strong>${products.length}</strong><span>motos normalizadas</span></div>
      <div><strong>${brands.size}</strong><span>marcas cubiertas</span></div>
      <div><strong>${withPrice}</strong><span>con precio referencial</span></div>
      <div><strong>${escapeHTML(topBucket)}</strong><span>rango dominante del filtro</span></div>
    `;
  }

  function renderRankings(products){
    const target = document.querySelector("#motos-recommended-rankings");
    if(!target) return;
    const buckets = [
      ["Mejor para trabajo", "workScore"],
      ["Mejor ciudad", "cityScore"],
      ["Mejor ruta", "routeScore"],
      ["Mejor para empezar", "beginnerScore"],
      ["Mejor valor", "valueScore"]
    ];
    target.innerHTML = buckets.map(([title, key]) => {
      const top = [...products].sort((a,b) => (b.motoSpecs?.[key] || 0) - (a.motoSpecs?.[key] || 0)).slice(0,4);
      return `
        <article class="moto-ranking-card">
          <h3>${escapeHTML(title)}</h3>
          <ol>${top.map(product => `<li><strong>${escapeHTML(product.name)}</strong><small>${escapeHTML(product.motoSpecs?.finalVerdict || "")}</small></li>`).join("")}</ol>
        </article>
      `;
    }).join("");
  }

  function populateBrandFilter(products){
    const select = document.querySelector("#moto-brand");
    if(!select || select.dataset.ready) return;
    const brands = [...new Set(products.map(product => product.brand))].sort((a,b) => a.localeCompare(b, "es"));
    select.insertAdjacentHTML("beforeend", brands.map(brand => `<option value="${escapeHTML(brand)}">${escapeHTML(brand)}</option>`).join(""));
    select.dataset.ready = "true";
  }

  function render(products){
    const grid = document.querySelector("#motos-complete-grid");
    const table = document.querySelector("#motos-complete-table");
    const count = document.querySelector("#motos-complete-count");
    if(!grid || !table) return;

    const sortMode = document.querySelector("#moto-sort")?.value || "marca";
    const filtered = sortProducts(filterProducts(products), sortMode);

    if(count) count.textContent = `${filtered.length} motos visibles de ${products.length} cargadas`;
    renderStats(products, filtered);
    grid.innerHTML = filtered.map(motoCard).join("");
    table.innerHTML = filtered.map(motoRow).join("");
  }

  async function init(){
    const targets = document.querySelectorAll("[data-motos-completas]");
    if(!targets.length) return;

    try{
      const products = (await fetchJson(DATA_PATHS)).filter(product => product.category === "motos");
      populateBrandFilter(products);
      renderRankings(products);
      ["#moto-search", "#moto-displacement", "#moto-price-status", "#moto-sort", "#moto-brand", "#moto-use"].forEach(selector => {
        const input = document.querySelector(selector);
        if(input){
          input.addEventListener("input", () => render(products));
          input.addEventListener("change", () => render(products));
        }
      });
      render(products);
    }catch(error){
      targets.forEach(target => {
        target.innerHTML = `<div class="ap-card"><h3>No se pudo cargar la sección de motos</h3><p>${escapeHTML(error.message)}</p></div>`;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
