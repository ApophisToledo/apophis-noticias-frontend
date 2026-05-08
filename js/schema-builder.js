
function buildArticleSchema(article){
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "author": {
            "@type": "Organization",
            "name": "Apophis"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Apophis"
        },
        "dateModified": article.updatedAt || "2026-05-08",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `https://apophis.com.ar/${article.category}/${article.slug}.html`
        }
    };
}

function buildFAQSchema(article){
    const faq = Array.isArray(article.faq) ? article.faq : [];

    if(!faq.length) return null;

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };
}

window.ApophisSchema = {
    buildArticleSchema,
    buildFAQSchema
};
