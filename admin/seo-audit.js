
async function loadSEOAudit(){

    const target = document.querySelector("#seo-audit");

    if(!target) return;

    try{

        const response = await fetch("../data/articles.json");
        const articles = await response.json();

        target.innerHTML = articles.map(article => {

            const score = article.seoScore || 0;

            let level = "Bajo";

            if(score >= 70) level = "Bueno";
            if(score >= 90) level = "Excelente";

            return `
                <article class="guide-card">
                    <span>${article.category}</span>
                    <h3>${article.title}</h3>

                    <div class="seo-score-bar">
                        <div class="seo-score-fill" style="width:${score}%"></div>
                    </div>

                    <p><strong>SEO:</strong> ${score}/100</p>
                    <p><strong>Nivel:</strong> ${level}</p>
                    <p><strong>Estado:</strong> ${article.status}</p>
                    <p><strong>Objetivo:</strong> ${article.wordTarget} palabras</p>
                </article>
            `;

        }).join("");

    }catch(error){
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", loadSEOAudit);
