
async function loadPriceTables(){

    const targets = document.querySelectorAll("[data-price-table]");

    if(!targets.length) return;

    const response = await fetch("../data/articles.json", { cache:"no-store" });
    const articles = await response.json();

    targets.forEach(target => {

        const category = target.dataset.category;

        const filtered = articles
            .filter(article => article.category === category)
            .slice(0,5);

        target.innerHTML = `
            <div class="comparison-table-wrapper">
                <table class="comparison-table">

                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Precio</th>
                            <th>Calidad</th>
                            <th>Practicidad</th>
                            <th>Conviene para</th>
                        </tr>
                    </thead>

                    <tbody>

                    ${filtered.map(article => `

                        <tr>
                            <td>${article.title}</td>
                            <td>${article.budgetTier}</td>
                            <td>${article.scores?.calidad || 0}/10</td>
                            <td>${article.scores?.practicidad || 0}/10</td>
                            <td>${(article.bestFor || []).join(", ")}</td>
                        </tr>

                    `).join("")}

                    </tbody>

                </table>
            </div>
        `;

    });

}

document.addEventListener("DOMContentLoaded", loadPriceTables);
