
function randomIndexStatus(score){

    if(score >= 85) return "Alta prioridad";
    if(score >= 70) return "Buena";
    if(score >= 50) return "Media";

    return "Baja";
}

async function loadFinalSEOAudit(){

    const target = document.querySelector("#final-seo-grid");

    if(!target) return;

    try{

        const response = await fetch("../data/articles.json");
        const articles = await response.json();

        const total = articles.length;

        const published = articles.filter(a => a.status === "published");

        const avgSEO = total
            ? Math.round(
                articles.reduce((acc, a) => acc + (a.seoScore || 0), 0) / total
            )
            : 0;

        document.querySelector("#seo-total").textContent = total;
        document.querySelector("#seo-published").textContent = published.length;
        document.querySelector("#seo-average").textContent = avgSEO + "/100";

        target.innerHTML = articles.map(article => {

            const score = article.seoScore || 0;

            return `
                <article class="guide-card">

                    <span>${article.category}</span>

                    <h3>${article.title}</h3>

                    <div class="seo-score-bar">
                        <div class="seo-score-fill" style="width:${score}%"></div>
                    </div>

                    <p><strong>SEO:</strong> ${score}/100</p>

                    <p><strong>Indexación:</strong> ${randomIndexStatus(score)}</p>

                    <p><strong>Estado:</strong> ${article.status}</p>

                    <p><strong>Palabras objetivo:</strong> ${article.wordTarget || 1800}</p>

                </article>
            `;

        }).join("");

    }catch(error){

        console.error(error);

    }

}

document.addEventListener("DOMContentLoaded", loadFinalSEOAudit);
