
const APOP_BASE_URL = "https://apophis.com.ar";

function escapeHTML(value){
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function articleUrl(article){
    return `./${article.category}/${article.slug}.html`;
}

function buildGuideCard(article){
    const isDraft = article.status !== "published";
    return `
        <article class="guide-card ${isDraft ? "is-draft" : ""}">
            <span>${escapeHTML(article.category)}</span>
            <h3>${escapeHTML(article.title)}</h3>
            <p>${escapeHTML(article.description)}</p>
            <div class="card-meta">
                <small>${escapeHTML(article.readingTime || "Guía")}</small>
                <small>${escapeHTML(article.updatedAt || "")}</small>
            </div>
            <a class="read-more" href="${escapeHTML(articleUrl(article))}">
                ${isDraft ? "Próximamente" : "Leer guía"}
            </a>
        </article>
    `;
}

async function loadGuideCatalog(){
    const containers = document.querySelectorAll("[data-guides]");
    if(!containers.length) return;

    try{
        const response = await fetch("./data/articles.json", { cache: "no-store" });
        const articles = await response.json();

        containers.forEach(container => {
            const category = container.dataset.category;
            const limit = Number(container.dataset.limit || 12);

            let filtered = Array.isArray(articles) ? articles : [];

            if(category){
                filtered = filtered.filter(article => article.category === category);
            }

            container.innerHTML = filtered.slice(0, limit).map(buildGuideCard).join("");
        });

    }catch(error){
        console.error("No se pudo cargar el catálogo de guías:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadGuideCatalog);
