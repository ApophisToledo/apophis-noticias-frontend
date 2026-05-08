(function(){
  const DATA_PATHS = ["../data/motos-brand-guides.json", "/data/motos-brand-guides.json", "./data/motos-brand-guides.json"];

  function escapeHTML(value){
    return String(value ?? "")
      .replace(/&/g,"&amp;")
      .replace(/</g,"&lt;")
      .replace(/>/g,"&gt;")
      .replace(/\"/g,"&quot;")
      .replace(/'/g,"&#039;");
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
    throw lastError || new Error("No se pudieron cargar las guías por marca");
  }

  function renderGuide(guide){
    return `
      <article class="moto-brand-guide-card">
        <span class="card-kicker">${escapeHTML(guide.modelCount)} modelos · ${escapeHTML(guide.displacementRange)}</span>
        <h3>${escapeHTML(guide.brand)}</h3>
        <p>${escapeHTML(guide.description)}</p>
        <a class="ap-btn ap-btn-small" href="${escapeHTML(guide.url || `./${guide.slug}.html`)}">Ver guía ${escapeHTML(guide.brand)}</a>
      </article>
    `;
  }

  async function init(){
    const target = document.querySelector("[data-motos-brand-guides]");
    if(!target) return;
    try{
      const guides = await fetchJson(DATA_PATHS);
      target.innerHTML = guides
        .slice()
        .sort((a,b) => String(a.brand).localeCompare(String(b.brand), "es"))
        .map(renderGuide)
        .join("");
    }catch(error){
      target.innerHTML = `<div class="ap-card"><h3>No se pudieron cargar las guías por marca</h3><p>${escapeHTML(error.message)}</p></div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
