
(function(){
  const GA_ID = "G-XXXXXXXXXX";

  if(!GA_ID || GA_ID.includes("XXXX")) {
    console.info("Apophis Analytics pendiente: reemplazar GA_ID.");
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("js", new Date());
  gtag("config", GA_ID);
})();
