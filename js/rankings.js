
async function loadRankings(){

    const target = document.querySelector("[data-ranking-grid]");

    if(!target) return;

    const response = await fetch("./data/articles.json", { cache:"no-store" });
    const articles = await response.json();

    function totalScore(article){
        const s = article.scores || {};
        return (s.calidad || 0) + (s.precio || 0) + (s.lujo || 0) + (s.practicidad || 0) + (s.mantenimiento || 0);
    }

    const ranked = [...articles]
        .filter(article => article.status === "published")
        .sort((a,b) => totalScore(b) - totalScore(a))
        .slice(0, 6);

    target.innerHTML = ranked.map((article, index) => `
        <article class="ranking-card ap-card">
            <div class="ranking-number">#${index + 1}</div>

            <span class="card-kicker">${article.category} · ${article.budgetTier}</span>

            <h3>${article.title}</h3>

            <p>${article.verdict || article.description}</p>

            <div class="mini-score-grid">
                ${Object.entries(article.scores || {}).map(([key,value]) => `
                    <div>
                        <span>${key}</span>
                        <strong>${value}/10</strong>
                    </div>
                `).join("")}
            </div>

            <a class="ap-btn ap-btn-small" href="./${article.category}/${article.slug}.html">
                Ver análisis
            </a>
        </article>
    `).join("");
}

document.addEventListener("DOMContentLoaded", loadRankings);
