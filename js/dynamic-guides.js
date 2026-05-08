
async function loadGuides(){

    const container = document.getElementById("dynamic-guides");

    if(!container) return;

    try{

        const response = await fetch("./data/articles.json");
        const articles = await response.json();

        articles.forEach(article => {

            const card = document.createElement("article");
            card.className = "guide-card";

            card.innerHTML = `
                <span>${article.category}</span>
                <h3>${article.title}</h3>
                <p>${article.description}</p>
                <a class="read-more"
                   href="./${article.category}/${article.slug}.html">
                   Leer guía
                </a>
            `;

            container.appendChild(card);

        });

    }catch(error){
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", loadGuides);
