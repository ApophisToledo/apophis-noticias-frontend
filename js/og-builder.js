
export function buildOG({
    title,
    description,
    image
}){

    return `
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${image}">
<meta property="og:type" content="article">
`;
}
