
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("img").forEach(img => {

        if(!img.getAttribute("loading")){
            img.setAttribute("loading", "lazy");
        }

        if(!img.getAttribute("decoding")){
            img.setAttribute("decoding", "async");
        }

    });

});
