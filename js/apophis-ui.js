
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem("apophis_theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  root.setAttribute("data-theme", theme);
})();

function toggleApophisTheme(){
  const root = document.documentElement;
  const current = root.getAttribute("data-theme") || "light";
  const next = current === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("apophis_theme", next);
}

function toggleMobileNav(){
  const nav = document.querySelector(".site-nav");
  if(nav){
    nav.classList.toggle("is-open");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-theme-toggle]").forEach(btn => {
    btn.addEventListener("click", toggleApophisTheme);
  });

  document.querySelectorAll("[data-mobile-menu]").forEach(btn => {
    btn.addEventListener("click", toggleMobileNav);
  });

  document.querySelectorAll("img").forEach(img => {
    if(!img.getAttribute("loading")) img.setAttribute("loading", "lazy");
    if(!img.getAttribute("decoding")) img.setAttribute("decoding", "async");
  });
});
