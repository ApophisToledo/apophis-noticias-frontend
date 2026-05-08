
document.addEventListener("DOMContentLoaded", () => {

    // keyboard focus helper
    document.body.addEventListener("keyup", (event) => {

        if(event.key === "Tab"){
            document.body.classList.add("keyboard-nav");
        }

    });

    // aria labels fallback
    document.querySelectorAll("button").forEach(button => {

        if(!button.getAttribute("aria-label") &&
           !button.textContent.trim()){

            button.setAttribute("aria-label", "Botón");

        }

    });

});
