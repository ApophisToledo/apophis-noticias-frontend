
document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("#login-form");
    const status = document.querySelector("#login-status");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value.trim();

        if(!email || !password){
            status.innerHTML = "<p style='color:red'>Completa todos los campos.</p>";
            return;
        }

        try{

            const response = await fetch("/api/auth/login", {
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
                status.innerHTML = `<p style='color:red'>${data.error || "No se pudo iniciar sesión."}</p>`;
                return;
            }

            localStorage.setItem("apophis_admin_token", data.token);
            status.innerHTML = "<p style='color:green'>Login correcto. Ya podés abrir cms.html.</p>";

        }catch(error){
            status.innerHTML = "<p style='color:red'>No se pudo conectar con el backend.</p>";
        }

    });

});
