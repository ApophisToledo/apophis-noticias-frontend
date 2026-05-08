
function slugify(text){
    return String(text || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function buildArticleFromForm(){
    const title = document.querySelector("#title").value.trim();
    const category = document.querySelector("#category").value;
    const description = document.querySelector("#description").value.trim();
    const subcategory = document.querySelector("#subcategory").value.trim();
    const keywords = document.querySelector("#keywords").value
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

    return {
        id: `${category}-${slugify(title)}`,
        title,
        slug: slugify(title),
        category,
        subcategory,
        description,
        keywords,
        status: "draft",
        readingTime: "10 min",
        updatedAt: new Date().toISOString().slice(0,10)
    };
}

function updatePreview(){
    const article = buildArticleFromForm();

    document.querySelector("#preview-title").textContent = article.title || "Título de la guía";
    document.querySelector("#preview-description").textContent = article.description || "Descripción SEO.";
    document.querySelector("#preview-url").textContent = `/${article.category}/${article.slug}.html`;
    document.querySelector("#json-output").textContent = JSON.stringify(article, null, 2);
}

function copyJSON(){
    const text = document.querySelector("#json-output").textContent;
    navigator.clipboard.writeText(text);
}

document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("input, textarea, select").forEach(el => {
        el.addEventListener("input", updatePreview);
        el.addEventListener("change", updatePreview);
    });

    document.querySelector("#copy-json").addEventListener("click", copyJSON);

    updatePreview();
});
