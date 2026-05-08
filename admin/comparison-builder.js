
function buildRatingCard(name, values){

    return `
    <article class="rating-card">
        <h3>${name}</h3>

        ${Object.entries(values).map(([key,val]) => `
            <div class="rating-line">
                <span>${key}</span>
                <div class="rating-bar">
                    <div class="rating-fill" style="width:${val * 10}%"></div>
                </div>
                <strong>${val}/10</strong>
            </div>
        `).join("")}
    </article>
    `;
}

function renderComparison(){

    const container = document.querySelector("#comparison-output");

    const productA = document.querySelector("#product-a").value.trim();
    const productB = document.querySelector("#product-b").value.trim();

    const valuesA = {
        "Calidad": Number(document.querySelector("#a-quality").value),
        "Precio": Number(document.querySelector("#a-price").value),
        "Lujo": Number(document.querySelector("#a-luxury").value),
        "Practicidad": Number(document.querySelector("#a-practical").value),
        "Mantenimiento": Number(document.querySelector("#a-maintenance").value)
    };

    const valuesB = {
        "Calidad": Number(document.querySelector("#b-quality").value),
        "Precio": Number(document.querySelector("#b-price").value),
        "Lujo": Number(document.querySelector("#b-luxury").value),
        "Practicidad": Number(document.querySelector("#b-practical").value),
        "Mantenimiento": Number(document.querySelector("#b-maintenance").value)
    };

    container.innerHTML = `
        ${buildRatingCard(productA || "Producto A", valuesA)}
        ${buildRatingCard(productB || "Producto B", valuesB)}
    `;

    document.querySelector("#comparison-html").value = `
<section class="premium-comparison">

<h2>Comparativa completa</h2>

<div class="comparison-ratings">

${buildRatingCard(productA || "Producto A", valuesA)}

${buildRatingCard(productB || "Producto B", valuesB)}

</div>

</section>
`.trim();

}

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", renderComparison);
    });

    document.querySelector("#copy-comparison").addEventListener("click", () => {
        navigator.clipboard.writeText(
            document.querySelector("#comparison-html").value
        );
    });

    renderComparison();

});
