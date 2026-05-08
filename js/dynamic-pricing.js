async function fetchPricingReference(){
    const paths = ["./data/pricing-reference.json", "../data/pricing-reference.json", "/data/pricing-reference.json"];
    let lastError = null;
    for(const path of paths){
        try{
            const response = await fetch(path, { cache:"no-store" });
            if(response.ok) return await response.json();
            lastError = new Error(`No se pudo cargar ${path}: ${response.status}`);
        }catch(error){
            lastError = error;
        }
    }
    throw lastError || new Error("No se pudo cargar pricing-reference.json");
}

async function loadDynamicPricing(){

    const targets = document.querySelectorAll("[data-dynamic-pricing]");

    if(!targets.length) return;

    try{
        const pricing = await fetchPricingReference();

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
                        Valores aproximados y orientativos. Verificar siempre precio final, patentamiento, flete, financiación y stock.
                    </small>

                </div>
            `;

        });
    }catch(error){
        targets.forEach(target => {
            target.innerHTML = `<div class="price-widget"><div class="price-widget-head">Referencia rápida no disponible</div><small>${error.message}</small></div>`;
        });
    }

}

document.addEventListener("DOMContentLoaded", loadDynamicPricing);
