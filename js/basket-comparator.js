
let BASKET_DATA = null;

async function initBasket(){
  const response = await fetch("./data/basket-comparator.json", { cache:"no-store" });
  BASKET_DATA = await response.json();

  renderControls();
  renderBasketItems();

  document.querySelector("#calculate-basket")
    .addEventListener("click", calculateBasket);
}

function renderControls(){
  const zone = document.querySelector("#basket-zone");
  const promo = document.querySelector("#basket-promo");
  const profile = document.querySelector("#basket-profile");

  if(zone){
    zone.innerHTML = BASKET_DATA.zones.map(z => `<option value="${z.id}">${z.name}</option>`).join("");
  }

  if(promo){
    promo.innerHTML = BASKET_DATA.promotions.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  }

  if(profile){
    profile.innerHTML = `
      <option value="single">Compra chica</option>
      <option value="couple">Pareja</option>
      <option value="family">Familia mensual</option>
    `;
  }
}

function renderBasketItems(){
  const target = document.querySelector("#basket-items");
  if(!target) return;

  target.innerHTML = BASKET_DATA.items.map(item => `
    <article class="ap-card basket-card" data-category="${item.category}">
      <label class="basket-check">
        <input type="checkbox" value="${item.id}">
        <span>
          <strong>${item.name}</strong>
          <small>${item.category}</small>
        </span>
      </label>
      <input class="basket-qty" data-qty="${item.id}" type="number" min="1" value="1" aria-label="Cantidad ${item.name}">
    </article>
  `).join("");
}

function multiplierByProfile(profile){
  if(profile === "family") return 4;
  if(profile === "couple") return 2;
  return 1;
}

function calculateBasket(){
  const selectedIds = [...document.querySelectorAll('#basket-items input[type="checkbox"]:checked')]
    .map(el => el.value);

  const result = document.querySelector("#basket-results");
  const zoneId = document.querySelector("#basket-zone").value;
  const promoId = document.querySelector("#basket-promo").value;
  const profile = document.querySelector("#basket-profile").value;

  if(!selectedIds.length){
    result.innerHTML = `
      <section class="verdict-box">
        <h2>Seleccioná productos</h2>
        <p>Marcá al menos un producto para calcular la canasta.</p>
      </section>
    `;
    return;
  }

  const zone = BASKET_DATA.zones.find(z => z.id === zoneId) || BASKET_DATA.zones[0];
  const promo = BASKET_DATA.promotions.find(p => p.id === promoId) || BASKET_DATA.promotions[0];
  const profileMultiplier = multiplierByProfile(profile);

  const selectedItems = BASKET_DATA.items.filter(i => selectedIds.includes(i.id));

  const totals = BASKET_DATA.stores.map(store => {
    let subtotal = selectedItems.reduce((sum, item) => {
      const qtyInput = document.querySelector(`[data-qty="${item.id}"]`);
      const qty = Math.max(1, Number(qtyInput?.value || 1));
      const unit = item.prices?.[store.id] || 0;
      const adjusted = unit * (zone.storeAdjustments?.[store.id] || 1);
      return sum + adjusted * qty * profileMultiplier;
    }, 0);

    const promoApplies = promo.appliesTo.includes(store.id);
    const discount = promoApplies ? subtotal * promo.discount : 0;
    const total = subtotal - discount;

    return {
      ...store,
      subtotal,
      discount,
      total,
      promoApplies
    };
  }).sort((a,b) => a.total - b.total);

  const cheapest = totals[0];
  const expensive = totals[totals.length - 1];
  const saving = expensive.total - cheapest.total;

  result.innerHTML = `
    <section class="verdict-box">
      <span class="eyebrow">Resultado</span>
      <h2>¿Dónde conviene comprar?</h2>
      <p>
        Para esta canasta en <strong>${zone.name}</strong>, la opción más conveniente es 
        <strong>${cheapest.name}</strong> con un total estimado de 
        <strong>$${Math.round(cheapest.total).toLocaleString("es-AR")}</strong>.
      </p>
      <p>
        El ahorro estimado contra la opción más cara es de 
        <strong>$${Math.round(saving).toLocaleString("es-AR")}</strong>.
      </p>
      <small>${BASKET_DATA.disclaimer}</small>
    </section>

    <div class="comparison-table-wrapper technical-table">
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Comercio</th>
            <th>Tipo</th>
            <th>Subtotal</th>
            <th>Descuento</th>
            <th>Total estimado</th>
          </tr>
        </thead>
        <tbody>
          ${totals.map(store => `
            <tr>
              <td>${store.name}</td>
              <td>${store.type}</td>
              <td>$${Math.round(store.subtotal).toLocaleString("es-AR")}</td>
              <td>${store.promoApplies ? "-$" + Math.round(store.discount).toLocaleString("es-AR") : "No aplica"}</td>
              <td><strong>$${Math.round(store.total).toLocaleString("es-AR")}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", initBasket);
