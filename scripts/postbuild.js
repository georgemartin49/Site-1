// Runs after `react-scripts build`.
// GitHub Pages serves files, not routes, so each page gets its own index.html
// (with its own title, description, and canonical URL), plus a 404.html for
// unknown addresses and a sitemap. It also prints content that needs review.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const build = path.join(root, "build");
const read = f => JSON.parse(fs.readFileSync(path.join(root, "src/content", f), "utf8"));
const site = read("site.json");
const sample = read("sample.json");
const presentations = read("presentations.json").presentations;

const routes = sample ? [...site.routes, site.sampleRoute] : site.routes;
const template = fs.readFileSync(path.join(build, "index.html"), "utf8");
const esc = s => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function page({ title, description, url, noindex }) {
  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(description)}">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(description)}">`,
    url ? `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}">` : "",
    noindex ? `<meta name="robots" content="noindex">` : "",
  ].join("");
  return template
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta name="description"[^>]*>/, "")
    .replace("</head>", `${head}</head>`);
}

for (const r of routes) {
  const dir = path.join(build, r.path);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page({ ...r, url: site.origin + r.path }));
}
fs.writeFileSync(path.join(build, "404.html"), page({
  title: "Page not found | Jacob B. Castleberry",
  description: "This page could not be found.",
  noindex: true,
}));

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(build, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map(r => `  <url><loc>${site.origin}${r.path}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`);

console.log(`postbuild: wrote ${routes.length} pages, 404.html, sitemap.xml`);

// Accepted talks whose month has passed are hidden from the site until marked delivered.
const month = today.slice(0, 7);
const stale = presentations.filter(p => p.status === "accepted" && p.date < month);
for (const p of stale) console.warn(`review: "${p.title}" (${p.date}) has passed; mark it delivered in presentations.json or remove it.`);
