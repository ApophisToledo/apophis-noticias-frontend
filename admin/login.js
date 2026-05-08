
const API = window.APOPHIS_API || {
    base:"",
    url(path){ return path; }
};

function setLoginStatus(target, message, isError = false){
    if(target){
        target.textContent = message;
        target.style.color = isError ? "red" : "green";
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#login-form");
    const status = document.querySelector("#login-status");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();

        if(!email || !password){
            setLoginStatus(status, "Completa todos los campos.", true);
            return;
        }

        try{

            const response = await fetch(API.url("/api/auth/login"), {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if(!data.ok){
                setLoginStatus(status, data.error || "No se pudo iniciar sesión.", true);
                return;
            }

            localStorage.setItem("apophis_admin_token", data.token);
            localStorage.setItem("admin_token_apophis", data.token);
            setLoginStatus(status, "Login correcto. Ya podés abrir cms.html o admin.html.");

        }catch(error){
            setLoginStatus(status, "No se pudo conectar con el backend.", true);
        }

    });

});
