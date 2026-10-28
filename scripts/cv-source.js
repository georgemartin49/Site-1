// The content the CV is built from. If it changes, the PDF must be remade
// (npm run cv:pdf); postbuild.js compares this fingerprint with the PDF's.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const dir = path.join(__dirname, "..", "src/content");
const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));

function cvFingerprint() {
  const site = read("site.json");
  const source = {
    cv: read("cv.json"),
    publications: read("publications.json"),
    presentations: read("presentations.json"),
    site: { email: site.email, cv: site.cv, teaching: site.teaching },
  };
  return crypto.createHash("sha256").update(JSON.stringify(source)).digest("hex");
}

module.exports = { cvFingerprint };
