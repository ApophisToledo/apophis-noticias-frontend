
async function loadAdSenseChecklist(){

  const target = document.querySelector("#adsense-checklist");
  if(!target) return;

  const response = await fetch("../data/articles.json", { cache:"no-store" });
  const articles = await response.json();

  const published = articles.filter(a => a.status === "published");
  const strong = published.filter(a => (a.seoScore || 0) >= 80);

  const checks = [
    {
      title:"Mínimo 10 artículos publicados",
      ok: published.length >= 10,
      detail:`Publicados: ${published.length}/10`
    },
    {
      title:"Guías con SEO alto",
      ok: strong.length >= 5,
      detail:`SEO alto: ${strong.length}/5`
    },
    {
      title:"Páginas legales",
      ok: true,
      detail:"Privacidad, términos, cookies/contacto preparados"
    },
    {
      title:"robots.txt y sitemap.xml",
      ok: true,
      detail:"Archivos técnicos presentes"
    },
    {
      title:"Modo mobile",
      ok: true,
      detail:"Responsive aplicado"
    },
    {
      title:"Analytics/Search Console",
      ok: false,
      detail:"Falta reemplazar tokens reales"
    },
    {
      title:"ads.txt real",
      ok: false,
      detail:"Falta publisher ID real"
    }
  ];

  target.innerHTML = checks.map(check => `
    <article class="ap-card checklist-card ${check.ok ? "ok" : "pending"}">
      <strong>${check.ok ? "✅" : "⚠️"} ${check.title}</strong>
      <p>${check.detail}</p>
    </article>
  `).join("");
}

document.addEventListener("DOMContentLoaded", loadAdSenseChecklist);
