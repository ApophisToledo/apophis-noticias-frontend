
async function loadSourceReferences(){
  const boxes = document.querySelectorAll("[data-source-refs]");
  if(!boxes.length) return;

  const response = await fetch("../data/research-sources.json", { cache:"no-store" });
  const sources = await response.json();

  boxes.forEach(box => {
    const ids = (box.dataset.sourceRefs || "").split(",").map(x => x.trim()).filter(Boolean);
    const matched = sources.filter(src => ids.includes(src.id));

    if(!matched.length){
      box.innerHTML = "";
      return;
    }

    box.innerHTML = `
      <section class="source-box">
        <h2>Fuentes consultadas</h2>
        <p>Referencias públicas usadas para orientar la guía. Los precios, stock y promociones pueden cambiar.</p>
        <ul>
          ${matched.map(src => `
            <li>
              <strong>${src.title}</strong>
              <small>${src.note}</small>
              <em>${src.url}</em>
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  });
}

document.addEventListener("DOMContentLoaded", loadSourceReferences);
