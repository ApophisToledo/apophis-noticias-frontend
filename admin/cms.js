
const API_BASE = "/api";

function getToken(){
    return localStorage.getItem("apophis_admin_token") || "";
}

function setStatus(message, isError = false){
    const target = document.querySelector("#cms-status");

    if(target){
        target.innerHTML = `<p style="color:${isError ? "red" : "green"}">${message}</p>`;
    }
}

function articlePayloadFromForm(){
    return {
        title:document.querySelector("#cms-title").value.trim(),
        category:document.querySelector("#cms-category").value,
        subcategory:document.querySelector("#cms-subcategory").value.trim(),
        description:document.querySelector("#cms-description").value.trim(),
        content:document.querySelector("#cms-content").value.trim(),
        keywords:document.querySelector("#cms-keywords").value
            .split(",")
            .map(item => item.trim())
            .filter(Boolean),
        status:document.querySelector("#cms-status-select").value,
        readingTime:document.querySelector("#cms-reading").value.trim() || "10 min"
    };
}

async function loadGuides(){
    const list = document.querySelector("#cms-guides");

    if(!list) return;

    try{
        const response = await fetch(`${API_BASE}/guides`);
        const data = await response.json();

        const guides = data.guides || [];

        list.innerHTML = guides.map(guide => `
            <article class="guide-card">
                <span>${guide.category}</span>
                <h3>${guide.title}</h3>
                <p>${guide.description}</p>
                <p><strong>Estado:</strong> ${guide.status}</p>
                <p><strong>Slug:</strong> ${guide.slug}</p>
            </article>
        `).join("");

    }catch(error){
        list.innerHTML = "<p>No se pudieron cargar las guías.</p>";
    }
}

async function saveGuide(event){
    event.preventDefault();

    const token = getToken();

    if(!token){
        setStatus("Falta token admin. Primero iniciar sesión.", true);
        return;
    }

    const payload = articlePayloadFromForm();

    try{
        const response = await fetch(`${API_BASE}/guides`, {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body:JSON.stringify(payload)
        });

        const data = await response.json();

        if(!data.ok){
            setStatus(data.error || "No se pudo guardar", true);
            return;
        }

        setStatus("Guía guardada correctamente.");
        await loadGuides();

    }catch(error){
        setStatus("Error al conectar con el backend.", true);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#cms-form");

    if(form){
        form.addEventListener("submit", saveGuide);
    }

    loadGuides();
});
