
async function loadCandidateStatus(){
  const target = document.querySelector("#candidate-status");
  if(!target) return;

  const response = await fetch("../data/candidate-status.json", { cache:"no-store" });
  const data = await response.json();

  target.innerHTML = `
    <div class="guide-grid">
      <article class="ap-card"><h3>Guías publicadas</h3><p class="big-number">${data.publishedGuides}</p></article>
      <article class="ap-card"><h3>Guías completas</h3><p class="big-number">${data.completeGuides}</p></article>
      <article class="ap-card"><h3>SEO alto</h3><p class="big-number">${data.highSeoGuides}</p></article>
      <article class="ap-card"><h3>Estado</h3><p>${data.recommendation}</p></article>
    </div>
    <section class="ap-card pending-box">
      <h2>Pendientes reales antes de AdSense</h2>
      <ul>${data.remaining.map(item => `<li>${item}</li>`).join("")}</ul>
    </section>
  `;
}

document.addEventListener("DOMContentLoaded", loadCandidateStatus);
