
function escapeHTML(value){
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function getValue(id){
    const el = document.querySelector(id);
    return el ? el.value.trim() : "";
}

function wordsCount(text){
    return String(text || "")
        .replace(/<[^>]*>/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .length;
}

function buildFAQHTML(){
    const faqItems = document.querySelectorAll(".faq-item");

    return Array.from(faqItems).map(item => {
        const question = item.querySelector(".faq-question").value.trim();
        const answer = item.querySelector(".faq-answer").value.trim();

        if(!question || !answer) return "";

        return `<h3>${escapeHTML(question)}</h3><p>${escapeHTML(answer)}</p>`;
    }).join("\n");
}

function buildListHTML(selector, title){
    const values = Array.from(document.querySelectorAll(selector))
        .map(input => input.value.trim())
        .filter(Boolean);

    if(!values.length) return "";

    return `<h2>${title}</h2><ul>${values.map(value => `<li>${escapeHTML(value)}</li>`).join("")}</ul>`;
}

function buildComparisonHTML(){
    const enabled = document.querySelector("#enable-comparison").checked;

    if(!enabled) return "";

    const c1 = escapeHTML(getValue("#comparison-col-1") || "Opción 1");
    const c2 = escapeHTML(getValue("#comparison-col-2") || "Opción 2");

    return `
<h2>Tabla comparativa</h2>
<table class="comparison-table">
<tr>
<th>Criterio</th>
<th>${c1}</th>
<th>${c2}</th>
</tr>
<tr>
<td>Precio relativo</td>
<td>${escapeHTML(getValue("#comp-price-1"))}</td>
<td>${escapeHTML(getValue("#comp-price-2"))}</td>
</tr>
<tr>
<td>Mantenimiento</td>
<td>${escapeHTML(getValue("#comp-maintenance-1"))}</td>
<td>${escapeHTML(getValue("#comp-maintenance-2"))}</td>
</tr>
<tr>
<td>Uso recomendado</td>
<td>${escapeHTML(getValue("#comp-use-1"))}</td>
<td>${escapeHTML(getValue("#comp-use-2"))}</td>
</tr>
</table>`;
}

function buildLongContent(){
    const intro = getValue("#block-intro");
    const criteria = getValue("#block-criteria");
    const costs = getValue("#block-costs");
    const recommendation = getValue("#block-recommendation");

    const content = `
<h2>Introducción</h2>
<p>${escapeHTML(intro)}</p>

${buildComparisonHTML()}

<h2>Qué tener en cuenta antes de decidir</h2>
<p>${escapeHTML(criteria)}</p>

${buildListHTML(".pro-input", "Ventajas principales")}

${buildListHTML(".con-input", "Desventajas a considerar")}

<h2>Costos reales y mantenimiento</h2>
<p>${escapeHTML(costs)}</p>

<h2>Recomendación final</h2>
<p>${escapeHTML(recommendation)}</p>

<h2>Preguntas frecuentes</h2>
${buildFAQHTML()}
`.trim();

    return content;
}

function buildStructuredPayload(){
    const content = buildLongContent();
    const pros = Array.from(document.querySelectorAll(".pro-input")).map(x => x.value.trim()).filter(Boolean);
    const cons = Array.from(document.querySelectorAll(".con-input")).map(x => x.value.trim()).filter(Boolean);
    const faq = Array.from(document.querySelectorAll(".faq-item")).map(item => ({
        question:item.querySelector(".faq-question").value.trim(),
        answer:item.querySelector(".faq-answer").value.trim()
    })).filter(item => item.question && item.answer);

    return {
        title:getValue("#article-title"),
        category:getValue("#article-category"),
        subcategory:getValue("#article-subcategory"),
        description:getValue("#article-description"),
        keywords:getValue("#article-keywords").split(",").map(x => x.trim()).filter(Boolean),
        status:getValue("#article-status"),
        readingTime:getValue("#article-reading") || "10 min",
        image:getValue("#article-image"),
        content,
        pros,
        cons,
        faq,
        wordTarget:Number(getValue("#article-word-target") || 1800)
    };
}

function calculateLocalScore(payload){
    let score = 0;
    const wordCount = wordsCount(payload.content);

    if(payload.title.length >= 35) score += 15;
    if(payload.description.length >= 100) score += 15;
    if(payload.keywords.length >= 3) score += 15;
    if(wordCount >= 1200) score += 15;
    if(wordCount >= 1800) score += 10;
    if(payload.pros.length >= 3) score += 10;
    if(payload.cons.length >= 3) score += 10;
    if(payload.faq.length >= 3) score += 10;

    return Math.min(score, 100);
}

function updatePreview(){
    const payload = buildStructuredPayload();
    const wordCount = wordsCount(payload.content);
    const score = calculateLocalScore(payload);

    document.querySelector("#preview-title").textContent = payload.title || "Título pendiente";
    document.querySelector("#preview-description").textContent = payload.description || "Descripción pendiente";
    document.querySelector("#word-count").textContent = wordCount;
    document.querySelector("#seo-score-live").textContent = `${score}/100`;
    document.querySelector("#content-output").value = payload.content;
    document.querySelector("#json-output").textContent = JSON.stringify(payload, null, 2);

    const checklist = [];

    checklist.push(payload.title.length >= 35 ? "✅ Título SEO suficiente" : "⚠️ Título corto");
    checklist.push(payload.description.length >= 100 ? "✅ Descripción completa" : "⚠️ Descripción corta");
    checklist.push(payload.keywords.length >= 3 ? "✅ Keywords suficientes" : "⚠️ Faltan keywords");
    checklist.push(wordCount >= 1200 ? "✅ Contenido mínimo aceptable" : "⚠️ Falta contenido largo");
    checklist.push(wordCount >= 1800 ? "✅ Objetivo ideal AdSense" : "⚠️ Aún no llega a 1800 palabras");
    checklist.push(payload.faq.length >= 3 ? "✅ FAQ suficiente" : "⚠️ Agregar al menos 3 FAQ");

    document.querySelector("#live-checklist").innerHTML = checklist.map(item => `<li>${item}</li>`).join("");
}

function addFAQ(){
    const box = document.querySelector("#faq-list");
    const item = document.createElement("div");
    item.className = "faq-item";
    item.innerHTML = `
        <label>Pregunta</label>
        <input class="faq-question" placeholder="Ej: ¿Cuál conviene más?">
        <label>Respuesta</label>
        <textarea class="faq-answer" placeholder="Respuesta clara y útil"></textarea>
    `;
    box.appendChild(item);
    bindInputs();
    updatePreview();
}

function bindInputs(){
    document.querySelectorAll("input, textarea, select").forEach(el => {
        el.removeEventListener("input", updatePreview);
        el.removeEventListener("change", updatePreview);
        el.addEventListener("input", updatePreview);
        el.addEventListener("change", updatePreview);
    });
}

function copyContent(){
    navigator.clipboard.writeText(document.querySelector("#content-output").value);
}

function copyJSON(){
    navigator.clipboard.writeText(document.querySelector("#json-output").textContent);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#add-faq").addEventListener("click", addFAQ);
    document.querySelector("#copy-content").addEventListener("click", copyContent);
    document.querySelector("#copy-json").addEventListener("click", copyJSON);

    bindInputs();
    updatePreview();
});
