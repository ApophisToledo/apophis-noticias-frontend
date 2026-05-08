
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll("img").forEach(img => {

        if(!img.hasAttribute("loading")){
            img.setAttribute("loading", "lazy");
        }

        if(!img.hasAttribute("decoding")){
            img.setAttribute("decoding", "async");
        }

        img.setAttribute("referrerpolicy", "no-referrer");

    });

    // reduce CLS
    document.querySelectorAll("iframe").forEach(frame => {
        frame.setAttribute("loading", "lazy");
    });

});
