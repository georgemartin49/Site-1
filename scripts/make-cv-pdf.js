// Prints the built /cv/ page to public/<site.cv.pdf>, so the PDF and the web
// page always show the same content. Run after `npm run build`:
//   npm run cv:pdf
// Needs Playwright and Chromium (CHROMIUM_PATH can point to a browser).
// FONT_DIR can point to local EB Garamond / IM Fell English files for machines
// that cannot reach Google Fonts.
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");
const { cvFingerprint } = require("./cv-source");

const root = path.join(__dirname, "..");
const build = path.join(root, "build");
const site = JSON.parse(fs.readFileSync(path.join(root, "src/content/site.json"), "utf8"));
if (!site.cv.pdf) { console.error("Set cv.pdf in site.json first."); process.exit(1); }

const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".woff2": "font/woff2" };
const server = http.createServer((req, res) => {
  let f = path.join(build, decodeURIComponent(req.url.split("?")[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream" });
  fs.createReadStream(f).pipe(res);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const page = await browser.newPage();
  if (process.env.FONT_DIR) {
    const fontDir = process.env.FONT_DIR;
    await page.route(/fonts\.googleapis\.com/, route => route.fulfill({ contentType: "text/css", body: fs.readFileSync(path.join(fontDir, "fonts.css"), "utf8") }));
    await page.route(/\/__fonts\//, route => route.fulfill({ contentType: "font/woff2", body: fs.readFileSync(path.join(fontDir, path.basename(route.request().url()))) }));
  }
  await page.goto(`${base}/cv/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  const out = path.join(root, "public", site.cv.pdf);
  await page.pdf({ path: out, format: "Letter", printBackground: false, displayHeaderFooter: true,
    headerTemplate: "<span></span>",
    footerTemplate: `<div style="font: 8pt Georgia, serif; width: 100%; text-align: center; color: #555;">Jacob B. Castleberry, CV, updated ${site.cv.updated} · <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
    margin: { top: "0.75in", bottom: "0.8in", left: "0.75in", right: "0.75in" } });
  fs.writeFileSync(path.join(root, "src/content/cv-pdf.json"), JSON.stringify({ file: site.cv.pdf, fingerprint: cvFingerprint() }, null, 2) + "\n");
  console.log(`wrote public/${site.cv.pdf}`);
  await browser.close();
  server.close();
})().catch(e => { console.error(e); process.exit(1); });
