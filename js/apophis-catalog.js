
async function getJSON(path){
  const response = await fetch(path, { cache: "no-store" });
  if(!response.ok) throw new Error("No se pudo cargar " + path);
  return response.json();
}

function escapeHTML(value){
  return String(value ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function guideUrl(article){
  return `../${article.category}/${article.slug}.html`;
}

function homeGuideUrl(article){
  return `./${article.category}/${article.slug}.html`;
}

function guideCard(article, home = false){
  const url = home ? homeGuideUrl(article) : guideUrl(article);
  const status = article.status === "published" ? "Publicada" : "Próximamente";
  return `
    <article class="ap-card guide-card-rich">
      <div class="card-kicker">${escapeHTML(article.category)} · ${escapeHTML(article.subcategory || "guía")}</div>
      <h3>${escapeHTML(article.title)}</h3>
      <p>${escapeHTML(article.description)}</p>
      <div class="card-meta">
        <span>${escapeHTML(article.readingTime || "Guía")}</span>
        <span>SEO ${escapeHTML(article.seoScore ?? 0)}/100</span>
        <span>${status}</span>
      </div>
      <a class="ap-btn ap-btn-small" href="${escapeHTML(url)}">Leer guía</a>
    </article>
  `;
}

async function renderHomeCatalog(){
  const target = document.querySelector("[data-home-guides]");
  if(!target) return;
  try{
    const articles = await getJSON("./data/articles.json");
    const published = articles.filter(a => a.status === "published").slice(0, 8);
    target.innerHTML = published.map(a => guideCard(a, true)).join("");
  }catch(err){
    target.innerHTML = "<p>No se pudieron cargar las guías.</p>";
  }
}

async function renderCategoryPage(category){
  const guideTarget = document.querySelector("[data-category-guides]");
  const subTarget = document.querySelector("[data-subcategory-list]");
  if(!guideTarget) return;

  try{
    const [articles, categories] = await Promise.all([
      getJSON("../data/articles.json"),
      getJSON("../data/categories.json")
    ]);
    const meta = categories.find(c => c.slug === category);
    const filtered = articles.filter(a => a.category === category);

    if(subTarget && meta){
      const grouped = {};
      filtered.forEach(article => {
        const key = article.subcategory || "general";
        grouped[key] = grouped[key] || [];
        grouped[key].push(article);
      });

      const known = meta.subcategories || [];
      const allSubs = Array.from(new Set([...known, ...Object.keys(grouped)]));

      subTarget.innerHTML = allSubs.map(sub => `
        <a class="subcategory-pill" href="#sub-${escapeHTML(sub)}">${escapeHTML(sub)}</a>
      `).join("");

      guideTarget.innerHTML = allSubs.map(sub => {
        const guides = grouped[sub] || [];
        return `
          <section class="subcategory-block" id="sub-${escapeHTML(sub)}">
            <div class="section-head">
              <span class="eyebrow">Subcategoría</span>
              <h2>${escapeHTML(sub)}</h2>
              <p>${guides.length ? "Guías disponibles para esta necesidad." : "Próximamente agregaremos guías completas."}</p>
            </div>
            <div class="guide-grid">
              ${guides.length ? guides.map(a => guideCard(a)).join("") : `<article class="ap-card"><h3>Contenido en preparación</h3><p>Esta subcategoría queda lista para futuras comparativas reales.</p></article>`}
            </div>
          </section>
        `;
      }).join("");
    }else{
      guideTarget.innerHTML = filtered.map(a => guideCard(a)).join("");
    }
  }catch(err){
    guideTarget.innerHTML = "<p>No se pudieron cargar las guías.</p>";
  }
}

document.addEventListener("DOMContentLoaded", renderHomeCatalog);
