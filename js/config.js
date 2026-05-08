(function(){
    const configured = "https://apophis-noticias-backend.vercel.app";
    const localHosts = ["localhost", "127.0.0.1"];

    if(!window.APOPHIS_API_BASE){
        window.APOPHIS_API_BASE = localHosts.includes(window.location.hostname)
            ? "http://localhost:3000"
            : configured;
    }

    window.APOPHIS_API = {
        base: window.APOPHIS_API_BASE.replace(/\/+$/, ""),
        url(path){
            const cleanPath = String(path || "").startsWith("/") ? path : `/${path}`;
            return `${this.base}${cleanPath}`;
        }
    };
})();
