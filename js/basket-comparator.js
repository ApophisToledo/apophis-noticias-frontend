
let BASKET_DATA = null;

async function initBasket(){
  const response = await fetch("./data/basket-comparator.json", { cache:"no-store" });
  BASKET_DATA = await response.json();

  renderBasketItems();

  document.querySelector("#calculate-basket")
    .addEventListener("click", calculateBasket);
}

function renderBasketItems(){
  const target = document.querySelector("#basket-items");
  if(!target) return;

  target.innerHTML = BASKET_DATA.items.map(item => `
    <article class="ap-card basket-card">
      <label class="basket-check">
        <input type="checkbox" value="${item.id}">
        <span>
          <strong>${item.name}</strong>
          <small>${item.category}</small>
        </span>
      </label>
    </article>
  `).join("");
}

function calculateBasket(){
  const selectedIds = [...document.querySelectorAll('#basket-items input:checked')]
    .map(el => el.value);

  const result = document.querySelector("#basket-results");

  if(!selectedIds.length){
    result.innerHTML = `
      <section class="verdict-box">
        <h2>Seleccioná productos</h2>
        <p>Marcá al menos un producto para calcular la canasta.</p>
      </section>
    `;
    return;
  }

  const selectedItems = BASKET_DATA.items.filter(i => selectedIds.includes(i.id));

  const totals = BASKET_DATA.stores.map(store => {
    const total = selectedItems.reduce((sum, item) => {
      return sum + (item.prices?.[store.id] || 0);
    }, 0);

    return {
      ...store,
      total
    };
  }).sort((a,b) => a.total - b.total);

  const cheapest = totals[0];

  result.innerHTML = `
    <section class="verdict-box">
      <span class="eyebrow">Resultado</span>
      <h2>¿Dónde conviene comprar?</h2>
      <p>
        Según los productos seleccionados, la opción más conveniente es 
        <strong>${cheapest.name}</strong> con un total estimado de 
        <strong>$${cheapest.total.toLocaleString("es-AR")}</strong>.
      </p>
    </section>

    <div class="comparison-table-wrapper technical-table">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Comercio</th>
            <th>Tipo</th>
            <th>Nivel ahorro</th>
            <th>Total estimado</th>
          </tr>
        </thead>
        <tbody>
          ${totals.map(store => `
            <tr>
              <td>${store.name}</td>
              <td>${store.type}</td>
              <td>${store.savingLevel}</td>
              <td>$${store.total.toLocaleString("es-AR")}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", initBasket);
