
async function loadAdvancedFilters(){

    const target = document.querySelector("[data-advanced-filters]");
    if(!target) return;

    const response = await fetch("./data/articles.json", {
        cache:"no-store"
    });

    const articles = await response.json();

    target.innerHTML = `
        <div class="advanced-filters-box">

            <select data-city-filter>
                <option value="all">Todas las ciudades</option>
                <option value="rosario">Rosario</option>
                <option value="argentina">Argentina</option>
            </select>

            <select data-budget-filter>
                <option value="all">Todos los presupuestos</option>
                <option value="bajo">Bajo</option>
                <option value="medio">Medio</option>
                <option value="alto">Alto</option>
            </select>

        </div>
    `;

    const city = target.querySelector("[data-city-filter]");
    const budget = target.querySelector("[data-budget-filter]");

    function applyFilters(){

        const cards = document.querySelectorAll(".visual-guide-card");

        cards.forEach(card => {

            const cardBudget = card.dataset.budget || "medio";

            let visible = true;

            if(budget.value !== "all" &&
               budget.value !== cardBudget){

                visible = false;

            }

            card.style.display = visible ? "" : "none";

        });

    }

    city.addEventListener("change", applyFilters);
    budget.addEventListener("change", applyFilters);

}
document.addEventListener("DOMContentLoaded", loadAdvancedFilters);
