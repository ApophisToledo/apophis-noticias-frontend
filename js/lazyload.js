
document.addEventListener("DOMContentLoaded", () => {

    const lazyImages = document.querySelectorAll("img[data-src]");

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting){
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute("data-src");
                obs.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => observer.observe(img));

});
