
async function loadCategoryRankings(){

    const targets = document.querySelectorAll("[data-category-ranking]");

    if(!targets.length) return;

    const response = await fetch("../data/articles.json", {
        cache:"no-store"
    });

    const articles = await response.json();

    targets.forEach(target => {

        const category = target.dataset.category;

        const filtered = articles
            .filter(article => article.category === category)
            .sort((a,b) =>
                ((b.scores?.calidad || 0) + (b.scores?.precio || 0))
                -
                ((a.scores?.calidad || 0) + (a.scores?.precio || 0))
            )
            .slice(0,5);

        target.innerHTML = filtered.map((article,index) => `
            <article class="ap-card ranking-inline">

                <div class="ranking-inline-number">
                    #${index + 1}
                </div>

                <div>

                    <span class="card-kicker">
                        ${article.subcategory || article.category}
                    </span>

                    <h3>${article.title}</h3>

                    <p>${article.description}</p>

                    <a class="ap-btn ap-btn-small"
                       href="../${article.category}/${article.slug}.html">
                       Leer análisis
                    </a>

                </div>

            </article>
        `).join("");

    });

}

document.addEventListener("DOMContentLoaded", loadCategoryRankings);
