
document.addEventListener("DOMContentLoaded", async () => {

    const input = document.querySelector("[data-guide-search]");
    const buttons = document.querySelectorAll("[data-filter]");
    const grid = document.querySelector("[data-home-guides]");

    if(!input || !grid) return;

    const response = await fetch("./data/articles.json");
    const articles = await response.json();

    let currentFilter = "all";

    function render(){

        const term = input.value.toLowerCase();

        const filtered = articles.filter(article => {

            const haystack = [
                article.title,
                article.description,
                ...(article.keywords || []),
                ...(article.needTags || [])
            ].join(" ").toLowerCase();

            const searchOk =
                !term || haystack.includes(term);

            const filterOk =
                currentFilter === "all" ||
                (article.needTags || []).includes(currentFilter);

            return searchOk && filterOk;

        });

        grid.innerHTML = filtered.map(article => `
            <article class="ap-card visual-guide-card">

                <div class="guide-thumb">
                    <img src="${article.thumbnail}" alt="${article.title}">
                </div>

                <div class="guide-content">

                    <span class="card-kicker">${article.category}</span>

                    <h3>${article.title}</h3>

                    <p>${article.description}</p>

                    <div class="guide-tags">
                        ${(article.needTags || []).map(tag =>
                            `<span>${tag}</span>`
                        ).join("")}
                    </div>

                    <a class="ap-btn ap-btn-small"
                       href="./${article.category}/${article.slug}.html">
                       Leer guía
                    </a>

                </div>

            </article>
        `).join("");

    }

    input.addEventListener("input", render);

    buttons.forEach(btn => {

        btn.addEventListener("click", () => {

            buttons.forEach(b => b.classList.remove("active"));

            btn.classList.add("active");

            currentFilter = btn.dataset.filter;

            render();

        });

    });

    render();

});
