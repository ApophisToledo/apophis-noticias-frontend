
async function loadBudgetFinder(){

    const form = document.querySelector("[data-budget-form]");
    const result = document.querySelector("[data-budget-result]");

    if(!form || !result) return;

    const response = await fetch("./data/articles.json", { cache:"no-store" });
    const articles = await response.json();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const need = form.querySelector("[name='need']").value;
        const budget = form.querySelector("[name='budget']").value;

        const matches = articles.filter(article => {
            const tags = article.needTags || [];
            const budgetOk = budget === "todos" || article.budgetTier === budget;
            const needOk = need === "todos" || tags.includes(need);
            return budgetOk && needOk && article.status === "published";
        });

        if(!matches.length){
            result.innerHTML = `
                <article class="ap-card empty-state">
                    <h3>No encontramos una guía exacta</h3>
                    <p>Probá con otro presupuesto o necesidad. También se pueden crear nuevas guías para cubrir este caso.</p>
                </article>
            `;
            return;
        }

        result.innerHTML = matches.map(article => `
            <article class="ap-card visual-guide-card compact">
                <div class="guide-content">
                    <span class="card-kicker">${article.category} · ${article.budgetTier}</span>
                    <h3>${article.title}</h3>
                    <p>${article.verdict || article.description}</p>
                    <a class="ap-btn ap-btn-small" href="./${article.category}/${article.slug}.html">
                        Leer recomendación
                    </a>
                </div>
            </article>
        `).join("");
    });
}

document.addEventListener("DOMContentLoaded", loadBudgetFinder);
