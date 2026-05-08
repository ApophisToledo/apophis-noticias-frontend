
async function loadDynamicPricing(){

    const targets = document.querySelectorAll("[data-dynamic-pricing]");

    if(!targets.length) return;

    const response = await fetch("./data/pricing-reference.json", {
        cache:"no-store"
    });

    const pricing = await response.json();

    targets.forEach(target => {

        const category = target.dataset.dynamicPricing;

        const rows = pricing[category] || [];

        target.innerHTML = `
            <div class="price-widget">

                <div class="price-widget-head">
                    Referencia rápida de mercado
                </div>

                ${rows.map(row => `
                    <div class="price-row">
                        <strong>${row[0]}</strong>
                        <span>${row[1]}</span>
                    </div>
                `).join("")}

                <small>
                    Valores aproximados y orientativos.
                </small>

            </div>
        `;

    });

}

document.addEventListener("DOMContentLoaded", loadDynamicPricing);
