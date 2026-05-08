(function(){
  const DATA_PATHS = ["../data/motos-decision-engine.json", "/data/motos-decision-engine.json", "./data/motos-decision-engine.json"];

  function escapeHTML(value){
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
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
    throw lastError || new Error("No se pudo cargar la guía de decisión de motos");
  }

  function renderProfile(profile){
    return `<article class="moto-decision-card">
      <span class="card-kicker">Perfil de compra</span>
      <h3>${escapeHTML(profile.title)}</h3>
      <p>${escapeHTML(profile.priority)}</p>
      <div class="moto-chip-row">${(profile.recommendedSegments || []).map(item => `<span>${escapeHTML(item)}</span>`).join("")}</div>
      <p><strong>Evitar:</strong> ${escapeHTML(profile.avoid)}</p>
      <ul>${(profile.checklist || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul>
    </article>`;
  }

  function renderUsage(guide){
    return `<article class="moto-usage-card">
      <h3>${escapeHTML(guide.title)}</h3>
      <p>${escapeHTML(guide.summary)}</p>
      <div class="moto-two-cols">
        <div><strong>Debe tener</strong><ul>${(guide.mustHave || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
        <div><strong>Alertas</strong><ul>${(guide.redFlags || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ul></div>
      </div>
    </article>`;
  }

  function renderClusters(clusters){
    return (clusters || []).map(cluster => `<a class="moto-cluster-link" href="${escapeHTML(cluster.url)}">
      <strong>${escapeHTML(cluster.title)}</strong>
      <small>${escapeHTML(cluster.intent)}</small>
    </a>`).join("");
  }

  async function init(){
    const root = document.querySelector("[data-motos-decision-engine]");
    if(!root) return;
    try{
      const data = await fetchJson(DATA_PATHS);
      root.innerHTML = `
        <div class="moto-decision-grid">${(data.buyerProfiles || []).map(renderProfile).join("")}</div>
        <div class="section-head section-head-small"><span class="eyebrow">Uso real</span><h3>Cómo elegir según el uso</h3></div>
        <div class="moto-usage-grid">${(data.usageGuides || []).map(renderUsage).join("")}</div>
        <div class="moto-checklist-box"><h3>Checklist local antes de señar</h3><ol>${(data.localPurchaseChecklist || []).map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ol></div>
        <div class="moto-cluster-box"><h3>Guías profundas de motos</h3><div>${renderClusters(data.seoClusters)}</div></div>
      `;
    }catch(error){
      root.innerHTML = `<div class="ap-card"><h3>No se pudo cargar la guía de decisión</h3><p>${escapeHTML(error.message)}</p></div>`;
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
