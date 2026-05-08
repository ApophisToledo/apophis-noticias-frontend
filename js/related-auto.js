
async function loadAutoRelated(){

  const container = document.querySelector("[data-related-auto]");
  if(!container) return;

  const category = container.dataset.category;
  const slug = container.dataset.slug;

  try{
    const response = await fetch("../data/articles.json", { cache:"no-store" });
    const articles = await response.json();

    let related = articles
      .filter(article => article.category === category && article.slug !== slug)
      .slice(0, 4);

    if(!related.length){
      related = articles.filter(article => article.slug !== slug).slice(0, 4);
    }

    container.innerHTML = related.map(article => `
      <article class="ap-card related-card">
        <span class="card-kicker">${article.category}</span>
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <a class="ap-btn ap-btn-small" href="../${article.category}/${article.slug}.html">Leer también</a>
      </article>
    `).join("");

  }catch(error){
    container.innerHTML = "";
  }
}

document.addEventListener("DOMContentLoaded", loadAutoRelated);
