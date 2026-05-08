
async function loadRelatedGuides(){

    const container = document.querySelector("#related-guides");

    if(!container) return;

    try{

        const response = await fetch("../data/articles.json");
        const articles = await response.json();

        container.innerHTML = articles.slice(0,4).map(article => `
            <article class="guide-card">
                <span>${article.category}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>

                <a class="read-more"
                   href="../${article.category}/${article.slug}.html">
                   Leer guía
                </a>
            </article>
        `).join("");

    }catch(error){
        console.error(error);
    }

}

document.addEventListener("DOMContentLoaded", loadRelatedGuides);
