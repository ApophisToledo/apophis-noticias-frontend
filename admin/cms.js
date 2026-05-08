const API = window.APOPHIS_API || {
    base:"",
    url(path){ return path; }
};
const API_BASE = API.url("/api");

function getToken(){
    return localStorage.getItem("apophis_admin_token") || localStorage.getItem("admin_token_apophis") || "";
}


function escapeHTML(value){
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function safeSlug(value){
    return String(value || "").replace(/[^a-z0-9-]/gi, "");
}

function setStatus(message, isError = false){
    const target = document.querySelector("#cms-status");

    if(target){
        target.textContent = message;
        target.style.color = isError ? "red" : "green";
    }
}

function setField(id, value){
    const el = document.querySelector(id);
    if(el) el.value = value || "";
}

function getField(id){
    const el = document.querySelector(id);
    return el ? el.value.trim() : "";
}

function articlePayloadFromForm(){
    return {
        title:getField("#cms-title"),
        category:getField("#cms-category"),
        subcategory:getField("#cms-subcategory"),
        description:getField("#cms-description"),
        content:getField("#cms-content"),
        image:getField("#cms-image-url"),
        keywords:getField("#cms-keywords")
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
        status:getField("#cms-status-select"),
        readingTime:getField("#cms-reading") || "10 min"
    };
}

function fillForm(guide){
    setField("#cms-current-slug", guide.slug);
    setField("#cms-title", guide.title);
    setField("#cms-category", guide.category);
    setField("#cms-subcategory", guide.subcategory);
    setField("#cms-description", guide.description);
    setField("#cms-content", guide.content);
    setField("#cms-image-url", guide.image);
    setField("#cms-keywords", Array.isArray(guide.keywords) ? guide.keywords.join(", ") : "");
    setField("#cms-status-select", guide.status || "draft");
    setField("#cms-reading", guide.readingTime || "10 min");
}

async function loadGuides(){
    const list = document.querySelector("#cms-guides");

    if(!list) return;

    try{
        const response = await fetch(`${API_BASE}/guides`);
        const data = await response.json();

        const guides = data.guides || [];

        list.innerHTML = guides.map(guide => {
            const slug = safeSlug(guide.slug);

            return `
                <article class="guide-card">
                    <span>${escapeHTML(guide.category)}</span>
                    <h3>${escapeHTML(guide.title)}</h3>
                    <p>${escapeHTML(guide.description)}</p>
                    <p><strong>Estado:</strong> ${escapeHTML(guide.status || "draft")}</p>
                    <p><strong>SEO:</strong> ${Number(guide.seoScore ?? 0)}/100</p>
                    <p><strong>Slug:</strong> ${escapeHTML(slug)}</p>
                    <div class="admin-actions">
                        <button type="button" data-action="edit" data-slug="${escapeHTML(slug)}">Editar</button>
                        <button type="button" data-action="delete" data-slug="${escapeHTML(slug)}">Eliminar</button>
                    </div>
                </article>
            `;
        }).join("");

        list.querySelectorAll("button[data-action]").forEach(button => {
            button.addEventListener("click", () => {
                const slug = button.dataset.slug;

                if(button.dataset.action === "edit"){
                    editGuide(slug);
                }

                if(button.dataset.action === "delete"){
                    deleteGuide(slug);
                }
            });
        });

    }catch(error){
        list.innerHTML = "<p>No se pudieron cargar las guías.</p>";
    }
}

async function editGuide(slug){
    try{
        const response = await fetch(`${API_BASE}/guides/slug/${slug}`);
        const data = await response.json();

        if(!data.ok){
            setStatus(data.error || "No se pudo cargar la guía.", true);
            return;
        }

        fillForm(data.guide);
        setStatus(`Editando: ${slug}`);

        window.scrollTo({ top:0, behavior:"smooth" });

    }catch(error){
        setStatus("Error al cargar guía.", true);
    }
}

async function saveGuide(event){
    event.preventDefault();

    const token = getToken();

    if(!token){
        setStatus("Falta token admin. Primero iniciar sesión.", true);
        return;
    }

    const currentSlug = getField("#cms-current-slug");
    const payload = articlePayloadFromForm();

    const method = currentSlug ? "PUT" : "POST";
    const url = currentSlug
        ? `${API_BASE}/guides/${currentSlug}`
        : `${API_BASE}/guides`;

    try{
        const response = await fetch(url, {
            method,
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify(payload)
        });

        const data = await response.json();

        if(!data.ok){
            const details = data.details ? `: ${data.details.join(", ")}` : "";
            setStatus((data.error || "No se pudo guardar") + details, true);
            return;
        }

        fillForm(data.guide);
        setStatus(currentSlug ? "Guía actualizada correctamente." : "Guía creada correctamente.");
        await loadGuides();

    }catch(error){
        setStatus("Error al conectar con el backend.", true);
    }
}

async function deleteGuide(slug){
    const token = getToken();

    if(!token){
        setStatus("Falta token admin. Primero iniciar sesión.", true);
        return;
    }

    if(!confirm(`¿Eliminar la guía ${slug}?`)){
        return;
    }

    try{
        const response = await fetch(`${API_BASE}/guides/${slug}`, {
            method:"DELETE",
            headers:{
                "Authorization":`Bearer ${token}`
            }
        });

        const data = await response.json();

        if(!data.ok){
            setStatus(data.error || "No se pudo eliminar.", true);
            return;
        }

        clearForm();
        setStatus("Guía eliminada.");
        await loadGuides();

    }catch(error){
        setStatus("Error al eliminar guía.", true);
    }
}

function clearForm(){
    setField("#cms-current-slug", "");
    setField("#cms-title", "");
    setField("#cms-subcategory", "");
    setField("#cms-description", "");
    setField("#cms-content", "");
    setField("#cms-image-url", "");
    setField("#cms-keywords", "");
    setField("#cms-status-select", "draft");
    setField("#cms-reading", "10 min");
}

async function uploadGuideImage(){
    const token = getToken();
    const input = document.querySelector("#cms-image");
    const output = document.querySelector("#cms-image-url");

    if(!token){
        setStatus("Falta token admin para subir imágenes.", true);
        return;
    }

    if(!input || !input.files || !input.files[0]){
        setStatus("Seleccioná una imagen.", true);
        return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = async () => {
        try{
            const response = await fetch(`${API_BASE}/upload/image`, {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({ image:reader.result })
            });

            const data = await response.json();

            if(!data.ok){
                setStatus(data.error || "No se pudo subir la imagen.", true);
                return;
            }

            output.value = data.image.url;
            setStatus("Imagen subida correctamente.");

        }catch(error){
            setStatus("Error al subir imagen.", true);
        }
    };

    reader.readAsDataURL(file);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#cms-form");

    if(form){
        form.addEventListener("submit", saveGuide);
    }

    const uploadButton = document.querySelector("#upload-image");
    if(uploadButton){
        uploadButton.addEventListener("click", uploadGuideImage);
    }

    const clearButton = document.querySelector("#clear-form");
    if(clearButton){
        clearButton.addEventListener("click", clearForm);
    }

    loadGuides();
});
