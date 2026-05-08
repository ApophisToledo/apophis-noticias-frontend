
async function loadBestBuy(){

    const target = document.querySelector("[data-best-buy]");

    if(!target) return;

    const response = await fetch("./data/articles.json", {
        cache:"no-store"
    });

    const articles = await response.json();

    const scored = articles.map(article => {

        const s = article.scores || {};

        const total =
            (s.calidad || 0) +
            (s.precio || 0) +
            (s.practicidad || 0);

        return {
            ...article,
            total
        };

    });

    scored.sort((a,b) => b.total - a.total);

    const best = scored[0];

    if(!best) return;

    target.innerHTML = `
        <article class="best-buy-card">

            <div class="best-buy-badge">
                Mejor compra del mes
            </div>

            <div class="best-buy-grid">

                <div class="best-buy-image">
                    <img src="${best.thumbnail}" alt="${best.title}">
                </div>

                <div class="best-buy-content">

                    <span class="card-kicker">
                        ${best.category}
                    </span>

                    <h2>${best.title}</h2>

                    <p>${best.verdict || best.description}</p>

                    <div class="guide-tags">
                        ${(best.needTags || []).map(tag =>
                            `<span>${tag}</span>`
                        ).join("")}
                    </div>

                    <a class="ap-btn"
                       href="./${best.category}/${best.slug}.html">
                       Ver recomendación
                    </a>

                </div>

            </div>

        </article>
    `;

}

document.addEventListener("DOMContentLoaded", loadBestBuy);
