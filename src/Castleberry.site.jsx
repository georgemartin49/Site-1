import { useState, useEffect } from "react";

// ── SITE-WIDE FACTS -- edit to update ──────────────────────────────
const EMAIL = "castleberryj@uindy.edu";
// One wording for the rights question, used everywhere it comes up.
const RIGHTS = "Unpublished writings of Ella Lyman Cabot appear by permission of the Ella Lyman Cabot Trust.";
const CV_UPDATED = "October 2026";
const CV_PDF = ""; // put the PDF in public/ (e.g. "castleberry-cv.pdf") and name it here to show a download link
const PHILPEOPLE = "https://philpeople.org/profiles/jacob-b-castleberry";

const FINDING_AID_ELC = "https://hollisarchives.lib.harvard.edu/repositories/8/resources/5278";
const FINDING_AID_RCC = "https://id.lib.harvard.edu/ead/hua02998/catalog";

// ── RESOURCES DATA ─────────────────────────────────────────────────
// cite: the rest of the citation after the title. url: a full-text copy or record.
const PRIMARY = [
  { author: "Ella Lyman Cabot", title: "Everyday Ethics", cite: "New York: Henry Holt, 1906.", url: "https://archive.org/details/cu31924031217874", source: "Internet Archive", note: "Her principal philosophical text; synthesizes Palmer and Royce into a pragmatist-feminist ethics of moral growth." },
  { author: "Ella Lyman Cabot", title: "Ethics for Children", cite: "Boston: Houghton Mifflin, 1910.", url: "https://onlinebooks.library.upenn.edu/webbin/book/lookupname?key=Cabot,+Ella+Lyman", source: "HathiTrust, via the Online Books Page" },
  { author: "Ella Lyman Cabot et al.", title: "A Course in Citizenship", cite: "Boston: Houghton Mifflin, 1914.", url: "https://archive.org/details/courseincitizens00cabouoft", source: "Internet Archive (later edition, A Course in Citizenship and Patriotism)" },
  { author: "Ella Lyman Cabot", title: "Seven Ages of Childhood", cite: "Boston: Houghton Mifflin, 1921.", url: "https://archive.org/details/sevenageschildh00cabogoog", source: "Internet Archive" },
  { author: "Ella Lyman Cabot", title: "Temptations to Rightdoing", cite: "1929.", note: "Her final major work; develops the distinction between loyalty, allegiance, and prejudice." },
  { author: "Ella Lyman Cabot", title: "Seven Suggestions to Parents", cite: "" },
  { author: "Richard Clarke Cabot", title: "What Men Live By: Work, Play, Love, Worship", cite: "Boston: Houghton Mifflin, 1914.", url: "https://archive.org/details/whatmenlivebywor00cabo", source: "Internet Archive" },
  { author: "Richard Clarke Cabot", title: "Adventures on the Borderland of Ethics", cite: "1926." },
  { author: "Richard Clarke Cabot", title: "The Meaning of Right and Wrong", cite: "New York: Macmillan, 1933.", url: "https://archive.org/details/meaningofrightwr0000rich", source: "Internet Archive (borrowable)", note: "His final philosophical work; engages the debate over moral agreement with Perry and Hocking." },
];
const ARCHIVES = [
  { title: "Papers of Ella Lyman Cabot, 1873–1934", cite: "Schlesinger Library, Radcliffe Institute, Harvard University. Collection A-139. 8.17 linear feet.", url: FINDING_AID_ELC, note: "Journals, travel journals, and correspondence, including nearly all of her letters with Richard Clarke Cabot; some letters survive only as typed transcripts." },
  { title: "Papers of Richard Clarke Cabot, 1886–1974", cite: "Harvard University Archives. HUG 4255. 255 boxes.", url: FINDING_AID_RCC, note: "Includes Ada Peirce McCormick's research materials on the Cabots (HUG 4255.80) and drafts of her unpublished biography of them." },
];
const SECONDARY = [
  { author: "Jacob B. Castleberry, Maughn Rollins Gregory, and Megan Jane Laverty, eds.", title: "Ella Lyman Cabot: Purposive Selfhood and the Philosophical Education of Children", cite: "Philosophy for Children Forebears. Manuscript complete; awaiting series editors' approval for submission to Routledge." },
  { author: "Jacob B. Castleberry", title: "Trauma and Diachronic Reasons-Responsive Moral Responsibility", cite: "Philosophy of Medicine 7, no. 1 (2026).", url: "https://doi.org/10.5195/pom.2026.284", source: "Open access" },
  { author: "Jacob B. Castleberry", title: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", cite: "The Pluralist, forthcoming." },
  { author: "Jacob B. Castleberry", title: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", cite: "Philosophy of Education, forthcoming 2027." },
  { author: "Jacob B. Castleberry", title: "An Organic Pragmatist Synthesis through Ella Lyman Cabot: A Review Essay of Diana Heney's American Ethics (2025)", cite: "The Pluralist, forthcoming 2027." },
  { author: "Diana Heney", title: "American Ethics: An Introduction to Pragmatist Moral Philosophy", cite: "2025." },
  { author: "Diana B. Heney", title: "The Virtue Ethics of Ella Lyman Cabot", cite: "History of Philosophy Quarterly 40, no. 4 (2023): 279–301.", url: "https://philpapers.org/rec/HENTVE", source: "PhilPapers record" },
  { author: "Samantha Matherne", title: "Ella Lyman Cabot's Everyday Ethics", cite: "In the Oxford Handbook of American and British Women Philosophers in the Nineteenth Century. Oxford University Press, 2023." },
  { author: "John Kaag", title: "Idealism, Pragmatism, and Feminism: The Philosophy of Ella Lyman Cabot", cite: "Lanham, MD: Lexington Books, 2011.", url: "https://philpapers.org/rec/KAAIPA-2", source: "PhilPapers record" },
];

// ── ROUTES ── each section has its own address (#/edition etc.) ────
const ROUTES = { Home: "", Edition: "edition", Research: "research", Publications: "publications", Teaching: "teaching", CV: "cv", Resources: "resources", Contact: "contact" };
const SECTIONS = Object.keys(ROUTES);
const NAV_LABEL = { Edition: "Cabot Edition" };
const label = s => NAV_LABEL[s] || s;
const href = s => (ROUTES[s] ? `#/${ROUTES[s]}` : "#/");
function sectionFromHash() {
  const slug = window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
  return SECTIONS.find(s => ROUTES[s] === slug) || "Home";
}
const isRouteHash = h => h === "" || h === "#" || h.startsWith("#/");

const Ext = ({ url, children }) => <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>;

// ── TOKENS ── derived from ELC's actual book bindings ─────────────
// Everyday Ethics (1906): deep wine/burgundy cloth
// Ethics for Children (1910) + Temptations to Rightdoing (1929): dusty slate blue
// All bindings: aged gilt gold lettering on warm cream pages
const C = {
  cream:    "#f5efe4",  // warm page-cream background
  creamDark:"#ede4d4",  // slightly darker cream for callouts
  wine:     "#5c1515",  // Everyday Ethics binding — headings, nav (11.66:1 on cream, AAA)
  wineDeep: "#4a1010",  // deeper wine for nav (13.37:1 on cream, AAA)
  wineHover:"#6b1a1a",  // hover state
  ink:      "#1a1209",  // near-black with warm undertone — body text (16.18:1, AAA)
  inkSub:   "#3a2a1a",  // warm dark secondary
  muted:    "#3d2a18",  // warm brown muted text (6.80:1 on cream, AAA)
  mutedLight:"#4f3c28", // lighter muted (4.55:1 on cream, AA)
  gold:     "#c9a84c",  // aged gilt — DECORATIVE ONLY, never text (fails contrast as text)
  slate:    "#3a5a7a",  // dusty slate blue from Ethics for Children (6.28:1, AAA)
  slateDeep:"#2a4a6a",  // deeper slate for links (8.03:1, AAA)
  border:   "#d4c9b8",  // warm taupe border
  borderDark:"#c4b9a8", // darker warm border
  navCream: "#f0e8d8",  // cream text on wine nav (10.26:1, AAA)
  navGold:  "#e8c97a",  // gilt gold on wine nav (7.31:1, AAA)
  newsSlate:"#3a5a7a",  // slate for news strip accent
  newsBg:   "#edf1f5",  // very light slate tint for news strip
};
const SERIF   = "'EB Garamond', Georgia, 'Times New Roman', serif";
const LABEL   = "'EB Garamond', Georgia, serif"; // small caps via font-variant-caps
const DISPLAY = "'EB Garamond', Georgia, 'Times New Roman', serif";
const FELL    = "'IM Fell English', Georgia, 'Times New Roman', serif";
const SANS = LABEL; // alias for backward compat with existing JSX references

// Convert 1..30 to Roman numerals — for the projects list, set in display caps.
function roman(n) {
  const r = [["XXX",30],["XX",20],["XIX",19],["XV",15],["XIV",14],["X",10],["IX",9],["V",5],["IV",4],["I",1]];
  let out = "";
  for (const [s, v] of r) while (n >= v) { out += s; n -= v; }
  return out;
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=IM+Fell+English:ital@0;1&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

#site-root {
  background: #f5efe4 !important;
  color: #1a1209 !important;
  color-scheme: light !important;
  min-height: 100vh;
  font-family: ${SERIF};
  font-size: 20px;
  line-height: 1.65;
  -webkit-text-size-adjust: 100%;
  font-feature-settings: "kern" 1, "liga" 1, "dlig" 1, "calt" 1;
  font-variant-numeric: oldstyle-nums proportional-nums;
  text-rendering: optimizeLegibility;
}

/* ── Skip nav ── */
.skip-link { position: absolute; left: -9999px; top: auto; width: 1px; height: 1px; overflow: hidden; }
.skip-link:focus {
  position: fixed; top: 0; left: 0; width: auto; height: auto;
  padding: 0.5rem 1.2rem; background: #4a1010 !important; color: #f0e8d8 !important;
  z-index: 9999; font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.06em;
  text-decoration: none; outline: none;
}

/* ── Nav ── */
.nav-wrap {
  background: #5c1515 !important;
  border-bottom: 2px solid #c9a84c;
  position: sticky; top: 0; z-index: 200;
}
.nav-inner { max-width: 1120px; margin: 0 auto; padding: 0 1.4rem; height: 58px; display: flex; align-items: center; justify-content: space-between; }
.nav-logo {
  font-family: ${FELL};
  font-size: 1.05rem; font-weight: 400; font-style: italic;
  color: #f0e8d8 !important; background: none; border: none; cursor: pointer;
  letter-spacing: 0.01em; text-decoration: none; white-space: nowrap;
}
.nav-logo:hover { color: #e8c97a !important; }
.nav-links { display: flex; list-style: none; }
.nav-btn {
  font-family: ${LABEL};
  font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none;
  color: rgba(240,232,216,0.78) !important; background: none; border: none;
  border-bottom: 2px solid transparent; cursor: pointer;
  padding: 0 10px; height: 58px; display: flex; align-items: center;
  transition: color 0.18s, border-color 0.18s; white-space: nowrap;
}
.nav-btn:hover { color: #f0e8d8 !important; }
.nav-btn.active { color: #f0e8d8 !important; border-bottom-color: #c9a84c; }
.nav-btn:focus-visible { outline: 2px solid #e8c97a; outline-offset: -2px; }

/* ── Hamburger ── */
.hamburger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
.hamburger span { display: block; width: 24px; height: 1.5px; background: #f0e8d8; border-radius: 1px; transition: transform 0.22s, opacity 0.22s; }
.mob-nav { display: none; background: #4a1010 !important; }
.mob-nav.open { display: block; }
.mob-btn {
  display: block; width: 100%;
  font-family: ${LABEL}; font-size: 0.92rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(240,232,216,0.75) !important; background: none; border: none;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 0.85rem 1.4rem; text-align: left; cursor: pointer; text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.mob-btn:hover, .mob-btn.active { background: rgba(255,255,255,0.08) !important; color: #f0e8d8 !important; }

/* ── Layout ── */
.page { max-width: 860px; margin: 0 auto; padding: 3.5rem 1.5rem 5.5rem; background: #f5efe4 !important; }

/* ── Typography ── */
h1 {
  font-family: ${DISPLAY}; font-weight: 500; font-style: normal;
  font-size: clamp(2.6rem, 6vw, 4rem); line-height: 1.02;
  color: #5c1515 !important; letter-spacing: 0;
  font-feature-settings: "kern" 1, "liga" 1, "dlig" 1, "swsh" 1;
}
h2 {
  font-family: ${DISPLAY}; font-weight: 500; font-style: italic;
  font-size: clamp(1.55rem, 3.2vw, 2.15rem); line-height: 1.2;
  color: #5c1515 !important; margin-bottom: 0.1em;
}
h3 {
  font-family: ${LABEL}; font-weight: 500; font-size: 0.95rem;
  font-variant-caps: all-small-caps; letter-spacing: 0.14em;
  color: #3d2a18 !important; margin-bottom: 0.6rem;
}
p { font-family: ${SERIF}; font-size: 1.05rem; line-height: 1.75; color: #1a1209 !important; }
p + p { margin-top: 1rem; text-indent: 1.4em; }
em { font-style: italic; }
strong { font-weight: 600; color: #1a1209 !important; }
a { color: #2a4a6a !important; text-underline-offset: 3px; }
a:hover { color: #5c1515 !important; }

/* Gold rule — decorative, like gilt on book spine */
.rule {
  width: 56px; height: 1px; background: #c9a84c;
  margin: 1.5rem 0 2rem;
}

/* Centered fleuron section divider — replaces or accompanies the gold rule */
.fleuron {
  text-align: center;
  font-family: ${FELL};
  color: #c9a84c;
  font-size: 1.5rem;
  line-height: 1;
  margin: 2.4rem auto;
  letter-spacing: 0.6em;
  padding-left: 0.6em; /* compensate for tracking */
}
.fleuron::before { content: "❦"; }

.lead {
  font-family: ${LABEL}; font-size: 1rem; letter-spacing: 0.05em;
  font-variant-caps: all-small-caps;
  color: #3d2a18 !important; margin: 0.4rem 0 1.6rem; line-height: 1.6;
}
.sub-label {
  font-family: ${LABEL}; font-size: 0.96rem; font-weight: 500;
  font-variant-caps: all-small-caps; letter-spacing: 0.12em;
  color: #3d2a18 !important; border-bottom: 1px solid #d4c9b8;
  padding-bottom: 0.45rem; margin-bottom: 1.2rem;
}

/* ── Masthead (home page) ── set like a 19c periodical front ── */
.masthead {
  text-align: center;
  padding: 1.6rem 0 2.2rem;
  border-top: 3px double #c9a84c;
  border-bottom: 3px double #c9a84c;
  margin: 0 0 2.4rem;
  position: relative;
}
.masthead-line {
  font-family: ${LABEL};
  font-variant-caps: all-small-caps;
  letter-spacing: 0.32em;
  font-size: 0.86rem;
  color: #4a1010 !important;
  padding-left: 0.32em;
  margin-bottom: 1.4rem;
}
.masthead-line .dot { color: #c9a84c; margin: 0 0.7em; }
.masthead h1 {
  font-size: clamp(2.8rem, 7vw, 4.4rem);
  font-weight: 500;
  font-style: normal;
  line-height: 1;
  letter-spacing: 0;
  margin: 0;
}
.masthead-motto {
  font-family: ${FELL};
  font-style: italic;
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
  color: #3d2a18 !important;
  line-height: 1.4;
  margin-top: 1rem;
}
.masthead-rule {
  width: 70%; max-width: 360px;
  height: 0;
  border-top: 1px solid #c9a84c;
  margin: 1.2rem auto 0;
  position: relative;
}
.masthead-rule::before {
  content: "❦";
  position: absolute;
  top: -0.7em;
  left: 50%;
  transform: translateX(-50%);
  background: #f5efe4;
  padding: 0 0.6rem;
  color: #c9a84c;
  font-family: ${FELL};
  font-size: 1.05rem;
}

/* ── Drop cap ── for opening prose paragraphs */
.dropcap::first-letter {
  font-family: ${DISPLAY};
  font-weight: 500;
  font-size: 4.2em;
  line-height: 0.86;
  float: left;
  padding: 0.05em 0.12em 0 0;
  margin-right: 0.04em;
  color: #5c1515;
  font-feature-settings: "swsh" 1;
}
.dropcap + p { text-indent: 0; }

/* Hanging indent for bibliography-style entries */
.hang {
  padding-left: 1.6em;
  text-indent: -1.6em;
}

/* ── Callouts ── */
.callout {
  background: #ede4d4 !important; border-left: 3px solid #c9a84c;
  padding: 1.3rem 1.6rem; margin-top: 1.8rem;
}
.callout p { color: #1a1209 !important; font-size: 0.94rem; }
.callout h3 { color: #3d2a18 !important; }
.callout-dark {
  background: #4a1010 !important; padding: 1.6rem 1.8rem;
  margin-top: 1.8rem; border-top: 2px solid #c9a84c;
}
.callout-dark p { color: #f0e8d8 !important; font-size: 0.94rem; line-height: 1.75; }
.callout-dark h3 { color: #e8c97a !important; }

/* ── Notices (journal-style, not an alert box) ── */
.news-strip {
  background: transparent !important;
  border-top: 1px solid #c4b9a8;
  border-bottom: 1px solid #c4b9a8;
  padding: 1rem 0 0.6rem;
  margin: 0 0 2.6rem;
}
.news-strip h3 {
  text-align: center;
  color: #5c1515 !important;
  font-variant-caps: all-small-caps;
  letter-spacing: 0.32em;
  padding-left: 0.32em;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.7rem;
}
.news-item { display: flex; gap: 1rem; align-items: baseline; padding: 0.32rem 0; border-bottom: 1px dotted #d4c9b8; }
.news-item:last-child { border-bottom: none; }
.news-date {
  font-family: ${FELL};
  font-style: italic;
  font-size: 1rem;
  color: #7a5c0f !important;
  min-width: 56px;
  flex-shrink: 0;
}
.news-text { font-family: ${SERIF}; font-size: 0.98rem; color: #1a1209 !important; line-height: 1.6; }

/* ── Specialization chips: set as catalog labels, not pill buttons ── */
.spec-grid { display: flex; flex-wrap: wrap; gap: 0.5rem 1.1rem; margin-top: 0.7rem; }
.spec-chip, .comp-chip {
  font-family: ${SERIF}; font-size: 0.98rem; font-style: italic;
  background: transparent !important; border: none;
  padding: 0; line-height: 1.5;
  color: #1a1209 !important;
  position: relative;
}
.spec-chip { color: #4a1010 !important; }
.spec-chip + .spec-chip::before, .comp-chip + .comp-chip::before {
  content: "❦";
  color: #c9a84c;
  font-family: ${FELL};
  font-style: normal;
  margin-right: 1.1rem;
  margin-left: -1.1rem;
  font-size: 0.8em;
  display: inline-block;
}

/* ── Projects ── */
.project-list { margin-top: 1.5rem; border-top: 1px solid #d4c9b8; }
.project-item { display: flex; gap: 1rem; padding: 1.1rem 0; border-bottom: 1px solid #d4c9b8; }
.project-num {
  font-family: ${FELL};
  font-size: 1.15rem;
  font-style: italic;
  letter-spacing: 0.04em;
  color: #c9a84c !important;
  min-width: 2.4rem;
  padding-top: 2px;
  text-align: right;
}
.project-title { font-family: ${DISPLAY}; font-size: 1.12rem; font-weight: 500; font-style: italic; color: #5c1515 !important; margin-bottom: 0.3rem; }
.project-desc { font-family: ${SERIF}; font-size: 0.98rem; line-height: 1.7; color: #3a2a1a !important; }
.project-desc + .project-desc, .project-item p + p { text-indent: 0; }

/* ── Paper list (research) ── set as catalog entries with italic venue */
.paper-group { margin-bottom: 1.4rem; }
.group-label {
  font-family: ${LABEL};
  font-variant-caps: all-small-caps;
  letter-spacing: 0.16em;
  font-size: 0.95rem;
  color: #5c1515 !important;
  margin-bottom: 0.7rem;
}
.paper-row { padding: 0.45rem 0 0.55rem 1.6em; text-indent: -1.6em; border-bottom: 1px dotted #d4c9b8; }
.paper-row:last-child { border-bottom: none; }
.paper-title { font-family: ${SERIF}; font-size: 1rem; color: #5c1515 !important; }
.paper-target { font-family: ${SERIF}; font-size: 0.96rem; font-style: italic; color: #3a5a7a !important; text-indent: 0; display: block; margin-top: 0.1rem; }

/* ── Reprint groups (research) ── */
.reprint-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.4rem 1.8rem; margin-top: 0.5rem; }
.reprint-author { font-family: ${DISPLAY}; font-style: italic; font-size: 1.04rem; color: #5c1515 !important; margin-bottom: 0.2rem; padding-top: 0.6rem; border-top: 1px solid #d4c9b8; }
.reprint-work { font-family: ${SERIF}; font-size: 0.96rem; color: #1a1209 !important; line-height: 1.5; padding-left: 1rem; text-indent: -1rem; }
@media (max-width: 640px) { .reprint-grid { grid-template-columns: 1fr; } }

/* ── Publications (set as a real bibliography: hanging indent, no rules) ── */
.pub-item {
  font-size: 1rem; line-height: 1.6;
  padding: 0.55rem 0 0.55rem 1.6em;
  text-indent: -1.6em;
  border-bottom: none;
}
.pub-title { font-family: ${SERIF}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; display: inline; }
.pub-title em { font-style: italic; }
.pub-meta { font-family: ${SERIF}; font-size: 1rem; color: #1a1209 !important; display: inline; text-indent: 0; }
.pub-meta::before { content: ". "; }
.pub-note { font-family: ${SERIF}; font-size: 0.92rem; font-style: italic; color: #3a5a7a !important; display: block; margin-top: 0.1rem; text-indent: 0; }

/* ── CV ── */
.cv-sec { margin-bottom: 2rem; }
.cv-item { display: flex; gap: 0.8rem; align-items: flex-start; margin-bottom: 0.65rem; }
.cv-dot { width: 5px; height: 5px; background: #c9a84c; margin-top: 10px; flex-shrink: 0; transform: rotate(45deg); }
.cv-title { font-family: ${DISPLAY}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; }
.cv-sub { font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 2px; }
.cv-box { display: inline-block; border: 1px solid #d4c9b8; border-top: 2px solid #c9a84c; padding: 1.1rem 1.4rem; margin-top: 1.8rem; background: #ede4d4 !important; }
.cv-link { font-family: ${LABEL}; font-size: 0.88rem; letter-spacing: 0.1em; color: #5c1515 !important; text-decoration: underline; text-underline-offset: 3px; }
.cv-link:hover { color: #3a5a7a !important; }

/* ── Teaching ── */
.inst-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1.4rem; margin-top: 0.8rem; }
.inst-item { display: flex; gap: 0.6rem; align-items: flex-start; padding: 0.55rem 0; border-bottom: 1px solid #ddd0bc; }
.inst-name { font-family: ${DISPLAY}; font-size: 0.96rem; color: #5c1515 !important; }
.inst-sub { font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 2px; }
.teach-philosophy { font-family: ${SERIF}; font-size: 0.97rem; line-height: 1.8; color: #1a1209 !important; }
.teach-philosophy + .teach-philosophy { margin-top: 1rem; }

/* ── Contact ── */
.contact-row { display: flex; gap: 1rem; align-items: flex-start; padding: 0.85rem 0; border-bottom: 1px solid #ddd0bc; }
.contact-label { font-family: ${LABEL}; font-size: 0.96rem; letter-spacing: 0.12em; text-transform: uppercase; color: #3d2a18 !important; min-width: 88px; padding-top: 3px; }
.contact-val { font-family: ${SERIF}; font-size: 0.96rem; color: #1a1209 !important; }
.contact-link { font-family: ${SERIF}; font-size: 0.96rem; color: #2a4a6a !important; text-underline-offset: 3px; }
.contact-link:hover { color: #5c1515 !important; }

/* ── Resources tabs ── */
.tab-row { display: flex; border-bottom: 1px solid #d4c9b8; margin-bottom: 1.3rem; }
.tab {
  font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.12em;
  text-transform: uppercase; padding: 0.55rem 1rem;
  background: none !important; border: none; border-bottom: 2px solid transparent;
  margin-bottom: -1px; cursor: pointer; color: #4f3c28 !important;
  transition: color 0.18s, border-color 0.18s;
}
.tab:hover { color: #5c1515 !important; }
.tab.active { color: #5c1515 !important; border-bottom-color: #5c1515; }
.res-item { padding: 0.8rem 0 0.8rem 1rem; border-left: 2px solid #d4c9b8; margin-bottom: 0.8rem; transition: border-color 0.22s; }
.res-item:hover { border-left-color: #c9a84c; }
.res-title { font-family: ${DISPLAY}; font-size: 1rem; font-weight: 500; color: #5c1515 !important; }
.res-year { font-family: ${SERIF}; font-size: 0.88rem; color: #3d2a18 !important; }
.res-meta { font-family: ${LABEL}; font-size: 0.86rem; letter-spacing: 0.08em; color: #3d2a18 !important; margin-top: 0.14rem; }
.res-note { font-family: ${SERIF}; font-size: 0.94rem; font-style: italic; color: #3a2a1a !important; margin-top: 0.2rem; }
.res-hint { font-family: ${SERIF}; font-size: 0.96rem; font-style: italic; color: #3d2a18 !important; margin-bottom: 1.1rem; }

/* ── Footer ── */
.footer { background: #4a1010 !important; border-top: 2px solid #c9a84c; padding: 1.8rem 1.5rem; }
.footer-inner {
  max-width: 860px; margin: 0 auto;
  display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
  text-align: center;
}
.footer p {
  font-family: ${SERIF};
  font-size: 0.9rem;
  color: rgba(240,232,216,0.7) !important;
  line-height: 1.5;
}
.footer a { color: rgba(240,232,216,0.7) !important; }
.footer a:hover { color: #f0e8d8 !important; }
.colophon {
  font-family: ${FELL} !important;
  font-style: italic;
  font-size: 0.88rem !important;
  color: rgba(240,232,216,0.55) !important;
  letter-spacing: 0.01em;
}
.colophon .pilcrow { color: #c9a84c; margin: 0 0.4em; }

/* ── Homepage links ── */
.home-links { display: flex; flex-wrap: wrap; gap: 0.4rem 1.8rem; margin: 1.6rem 0 2.2rem; }
.home-links a {
  font-family: ${LABEL}; font-variant-caps: all-small-caps; letter-spacing: 0.12em; font-size: 1.05rem;
  color: #5c1515 !important; text-decoration: none; border-bottom: 1px solid #c9a84c; padding-bottom: 1px;
}
.home-links a:hover { color: #2a4a6a !important; border-bottom-color: #2a4a6a; }

/* ── Status lines, notes, edition page ── */
.status { font-family: ${SERIF}; font-size: 0.98rem; color: #1a1209 !important; margin: 0.25rem 0 0.55rem; line-height: 1.55; }
.status-label { font-variant-caps: all-small-caps; letter-spacing: 0.12em; color: #5c1515; font-weight: 600; margin-right: 0.35em; }
.lead-italic { font-family: ${DISPLAY}; font-style: italic; font-size: 1.2rem; color: #3d2a18 !important; margin: -0.8rem 0 0.9rem; }
.small-note { font-family: ${SERIF}; font-size: 0.92rem; font-style: italic; color: #4f3c28 !important; margin-top: 0.8rem; text-indent: 0 !important; }
.provisional { font-style: italic; font-variant-caps: normal; letter-spacing: 0; color: #7a5c0f; margin-left: 0.4em; text-transform: none; }
.ed-sec, .pub-sec { margin-top: 2.4rem; }
.ed-sec .project-list { border-top: none; margin-top: 0; }
.scope-row { display: grid; grid-template-columns: 13rem 1fr; gap: 0.2rem 1.4rem; padding: 0.6rem 0; border-bottom: 1px dotted #d4c9b8; }
.scope-row:last-child { border-bottom: none; }
.scope-h { font-family: ${DISPLAY}; font-style: italic; font-size: 1.05rem; color: #5c1515 !important; }
.scope-d { font-family: ${SERIF}; font-size: 0.98rem; line-height: 1.6; }
.method-list { padding-left: 1.3rem; }
.method-list li { font-family: ${SERIF}; font-size: 1rem; line-height: 1.65; margin-bottom: 0.45rem; }
.method-list li::marker { color: #c9a84c; }
.specimen { border-top: 1px solid #c9a84c; border-bottom: 1px solid #c9a84c; padding: 1.2rem 0; }
.specimen-title { font-family: ${DISPLAY}; font-style: italic; font-size: 1.15rem; color: #5c1515 !important; }
.specimen-source { font-family: ${SERIF}; font-size: 0.9rem; color: #4f3c28 !important; margin-bottom: 0.9rem; }
.specimen-notes { font-size: 0.88rem; padding-left: 1.3rem; margin-top: 1rem; }

/* ── CV header ── */
.cv-head { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 0.6rem 1.4rem; margin-bottom: 2rem; }
.cv-dated { font-family: ${SERIF}; font-style: italic; font-size: 0.98rem; color: #3d2a18 !important; }
.cv-actions { display: flex; gap: 1.2rem; }
.cv-print { background: none; border: none; cursor: pointer; padding: 0; }

/* ── Print ── */
@media print {
  .nav-wrap, .footer, .hamburger, .mob-nav, .news-strip, .skip-link, .spec-grid, .no-print, .home-links { display: none !important; }
  .cv-head { margin-bottom: 1rem; }
  #site-root { font-size: 11pt !important; background: white !important; color: black !important; }
  .page { max-width: 100% !important; padding: 0 !important; }
  h1, h2 { color: black !important; }
  h3, .sub-label { color: #333 !important; }
  p, .pub-meta, .cv-sub, .inst-sub, .project-desc { color: black !important; }
  .pub-title, .cv-title, .project-title, .inst-name, .res-title { color: black !important; }
  .callout { background: #f5f5f5 !important; border-left: 2pt solid #999; }
  .callout-dark { background: #f0f0f0 !important; border-top: 1pt solid #999; }
  .callout-dark p, .callout-dark h3 { color: black !important; }
  a { color: black !important; }
  .cv-dot { background: #999; }
  .project-item, .pub-item, .cv-item { page-break-inside: avoid; }
}

/* ── Responsive ── */
@media (max-width: 1080px) {
  .nav-links { display: none !important; }
  .hamburger { display: flex !important; }
}
@media (max-width: 640px) {
  #site-root { font-size: 18px; }
  .scope-row { grid-template-columns: 1fr; }
  .page { padding: 2rem 1.1rem 4rem; }
  .inst-grid { grid-template-columns: 1fr; }
  .footer-inner { flex-direction: column; align-items: flex-start; }
  .contact-row { flex-direction: column; gap: 0.25rem; }
  .contact-label { min-width: unset; }
}
`;

// ── PRIMITIVES ────────────────────────────────────────────────────
const Rule = () => <div className="rule" />;
const Dot = () => <div className="cv-dot" />;

// ── HOME ──────────────────────────────────────────────────────────
// Keep this to the three most recent items.
const NEWS = [
  { date: "Jan 2027", text: "Three papers at the APA Eastern Division meeting in Boston, including a Josiah Royce Society and Ralph Waldo Emerson Society session I am organizing." },
  { date: "Nov 2026", text: "\"Two Orders of Love: Ella Lyman Cabot Versus MacIntyre\" at the Society of Christian Philosophers Eastern Regional Meeting." },
  { date: "Oct 2026", text: <>"Trauma and Diachronic Reasons-Responsive Moral Responsibility" published in <Ext url="https://doi.org/10.5195/pom.2026.284"><em>Philosophy of Medicine</em> 7, no. 1</Ext>.</> },
];

function Home() {
  return (
    <div className="sec">
      <header className="masthead">
        <div className="masthead-line">
          Moral Philosopher <span className="dot">·</span> Independent Scholar <span className="dot">·</span> MMXXVI
        </div>
        <h1>Jacob B. Castleberry</h1>
        <p className="masthead-motto">A recovery of the Boston ethics tradition</p>
        <div className="masthead-rule" />
      </header>

      <p className="dropcap">I am a moral philosopher working in American pragmatism, ethics, moral responsibility, and the philosophy of education. I teach as an Associate Adjunct in Philosophy at the University of Indianapolis. Most of my research concerns Ella Lyman Cabot (1866–1934), a Boston philosopher and educator who studied with George Herbert Palmer and Josiah Royce at Harvard and served on the Massachusetts Board of Education for nearly three decades.</p>
      <p>By the Boston ethics tradition I mean the moral philosophy that Palmer, Royce, and Ella Lyman and Richard Clarke Cabot developed at Harvard in the late nineteenth and early twentieth centuries: a body of work on selfhood, moral growth, and purposive agency that the discipline has largely set aside. I am preparing a comprehensive edition of Cabot's writings, based on her papers at the Schlesinger Library, which I have digitized and transcribed in full. I am also writing <em>An Untold American Philosophy of Love</em>, a book that develops her philosophy to argue for love as the normative foundation of ethics.</p>

      <nav className="home-links" aria-label="Start here">
        <a href={href("Edition")}>The Cabot Edition</a>
        <a href={href("Publications")}>Publications</a>
        <a href={href("CV")}>Curriculum Vitae</a>
      </nav>

      <div className="news-strip">
        <h3>Notices</h3>
        {NEWS.map((n, i) => (
          <div key={i} className="news-item">
            <span className="news-date">{n.date}</span>
            <span className="news-text">{n.text}</span>
          </div>
        ))}
      </div>

      <p>My work has received the 2026 Harris-Jones Prize from the Society for the Advancement of American Philosophy and a 2026 Research Award from the Ralph Waldo Emerson Society. I hold an MA in philosophy from Western Michigan University and a BA from Indiana University Kokomo.</p>

      <div className="fleuron" />

      <div style={{ marginTop: "0.6rem" }}>
        <div className="sub-label">Areas of Specialization</div>
        <div className="spec-grid">
          {["Pragmatist metaphysics and history of American philosophy","Metaethics","Moral responsibility","Philosophy of education"].map((s,i) => <span key={i} className="spec-chip">{s}</span>)}
        </div>
        <div style={{ marginTop: "1.4rem" }}>
          <div className="sub-label">Areas of Competence</div>
          <div className="spec-grid">
            {["Epistemology","Philosophy of mind","Feminist philosophy","Ethics","Philosophy of science"].map((s,i) => <span key={i} className="comp-chip">{s}</span>)}
          </div>
        </div>
      </div>

      <div className="callout-dark" style={{ marginTop: "2rem" }}>
        <h3>The Boston Ethics Tradition Recovery Program</h3>
        <p style={{ marginTop: "0.5rem" }}>The name I give to my editorial and archival work on Palmer, Royce, and Ella Lyman and Richard Clarke Cabot. I direct it as principal investigator. At present it comprises the Cabot edition and the archival transcription behind it, and the Routledge volume of Cabot's writings on children's philosophical education, which I am co-editing with Maughn Rollins Gregory and Megan Jane Laverty. All proceeds from the program go to the Ella Lyman Cabot Trust.</p>
      </div>
    </div>
  );
}

// ── CABOT EDITION ─────────────────────────────────────────────────
const EDITION_STATUS = "In preparation. Not yet under contract.";

const EDITION_SCOPE = [
  { h: "Published books and essays", d: <><em>Everyday Ethics</em> (1906), <em>Ethics for Children</em> (1910), <em>A Course in Citizenship</em> (1914), <em>Seven Ages of Childhood</em> (1921), <em>Temptations to Rightdoing</em> (1929), and her shorter published writing.</> },
  { h: "Philosophical manuscripts", d: <>Drafts of the unfinished book on growth that Royce encouraged her to write; her 1890 examination answers for Palmer's ethics course; "The Place of Pleasure"; "Marriage" (1889); "Civil Service Versus the Sword" (1915); "On Immortality"; and her commentary on Royce's <em>The World and the Individual</em>.</> },
  { h: "Letters", d: "Her correspondence, above all the letters exchanged with Richard Clarke Cabot, which survive almost in full, some only as typed transcripts." },
  { h: "Poetry", d: "Poems spread across ten manuscript collections, most of them unpublished; the only earlier selection is the private family pamphlet 52 Poems (1935)." },
  { h: "Journals and notebooks", d: "Journals, travel journals, and working notebooks." },
];

// Provisional: the arrangement will be settled with the publisher.
const EDITION_VOLUMES = [
  { t: "Ethical Writings", d: "The published books on ethics and moral education." },
  { t: "Philosophical Manuscripts", d: "The unpublished essays, drafts, and course writings, with her commentary on Royce." },
  { t: "Letters", d: "Selected correspondence, centered on the Ella and Richard Cabot letters." },
  { t: "Poems", d: "The poetry, gathered from the manuscript collections." },
  { t: "Journals and Notebooks", d: "Selections from the journals and notebooks." },
];

const EDITION_METHOD = [
  "An introduction to each volume placing its texts in Cabot's life and in the Palmer–Royce circle.",
  "A headnote for each text giving its date, occasion, and source.",
  "Annotation identifying people, sources, and allusions, with cross-references between the published books and the unpublished manuscripts.",
  "Textual notes recording significant variants between drafts, and between manuscripts and printed versions.",
  "Documentation of every source by collection, box, and folder; where a letter survives only as a typed transcript, that is stated.",
];

// Fill in to publish a short edited specimen: { title, source, text: [paragraphs], notes: [strings] }
const EDITION_SAMPLE = null;

function Edition() {
  return (
    <div className="sec">
      <h2>The Cabot Edition</h2>
      <Rule />
      <p className="lead-italic">A comprehensive edition of the writings of Ella Lyman Cabot (1866–1934)</p>
      <div className="status"><span className="status-label">Status</span> {EDITION_STATUS}</div>

      <p>Cabot wrote across forms. She published books on ethics and moral education. She also left philosophical manuscripts, a large correspondence, a body of poetry, and journals kept over most of her life. Only part of it has ever been printed. The edition is meant to collect all of it, so that her philosophy can be read in the forms in which she actually worked it out.</p>

      <div className="ed-sec">
        <div className="sub-label">Scope</div>
        {EDITION_SCOPE.map((s, i) => (
          <div key={i} className="scope-row">
            <div className="scope-h">{s.h}</div>
            <div className="scope-d">{s.d}</div>
          </div>
        ))}
      </div>

      <div className="ed-sec">
        <div className="sub-label">Collections and work completed</div>
        <div className="pub-item">
          <div className="pub-title"><Ext url={FINDING_AID_ELC}>Papers of Ella Lyman Cabot, 1873–1934</Ext></div>
          <div className="pub-meta">Schlesinger Library, Radcliffe Institute, Harvard University, Collection A-139 (8.17 linear feet)</div>
          <div className="pub-note">Digitized and transcribed in full.</div>
        </div>
        <div className="pub-item">
          <div className="pub-title"><Ext url={FINDING_AID_RCC}>Papers of Richard Clarke Cabot</Ext></div>
          <div className="pub-meta">Harvard University Archives, HUG 4255, including Ada Peirce McCormick's research materials (HUG 4255.80) and drafts of her unpublished biography of the Cabots</div>
          <div className="pub-note">About 16,000 photographs taken; sorting and transcription under way, supported by a 2026 Research Award from the Ralph Waldo Emerson Society.</div>
        </div>
        <p className="small-note">{RIGHTS}</p>
      </div>

      <div className="ed-sec">
        <div className="sub-label">Arrangement of volumes <span className="provisional">provisional</span></div>
        <div className="project-list">
          {EDITION_VOLUMES.map((v, i) => (
            <div key={i} className="project-item">
              <div className="project-num">{roman(i + 1)}</div>
              <div>
                <div className="project-title">{v.t}</div>
                <div className="project-desc">{v.d}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="small-note">The number, order, and contents of the volumes will be settled with the publisher.</p>
      </div>

      <div className="ed-sec">
        <div className="sub-label">Editorial approach</div>
        <ul className="method-list">
          {EDITION_METHOD.map((m, i) => <li key={i}>{m}</li>)}
        </ul>
      </div>

      <div className="ed-sec">
        <div className="sub-label">Sample</div>
        {EDITION_SAMPLE ? (
          <div className="specimen">
            <div className="specimen-title">{EDITION_SAMPLE.title}</div>
            <div className="specimen-source">{EDITION_SAMPLE.source}</div>
            {EDITION_SAMPLE.text.map((t, i) => <p key={i}>{t}</p>)}
            {EDITION_SAMPLE.notes && <ol className="specimen-notes">{EDITION_SAMPLE.notes.map((n, i) => <li key={i}>{n}</li>)}</ol>}
          </div>
        ) : (
          <p>An edited sample with full annotation is available to editors on request: <a href={`mailto:${EMAIL}?subject=Cabot%20edition%20sample`}>{EMAIL}</a>.</p>
        )}
      </div>

      <div className="ed-sec">
        <div className="sub-label">Collaboration</div>
        <p>I would be glad to hear from press and series editors; from scholars who would like to take on the annotation of a volume, particularly the letters or the poems; and from librarians or collectors who hold Cabot material outside the two Harvard collections.</p>
      </div>
    </div>
  );
}

// ── RESEARCH ──────────────────────────────────────────────────────
// Status is shown as prominently as the title.
const PROJECTS = [
  {
    t: <><em>An Untold American Philosophy of Love: Ella Lyman Cabot on Becoming Ourselves</em></>,
    s: "Monograph in progress, about 90,000 words. Proposal invited by John Kaag for Bloomsbury's American Philosophy Series; not under contract.",
    d: "My current priority. The book reconstructs and develops Cabot's philosophy to argue for love as the normative foundation of ethics: how attraction and commitment give a life a chosen purpose, how a relationship makes particular obligations one's own and keeps them binding through failure, and how loving another person adequately requires recognizing that person's independent purposes. Later chapters set Cabot beside MacIntyre and contemporary work on attention, practical identity, and aspiration, and develop an account of forgiveness as a test of accountability and changed purposes.",
  },
  {
    t: <>The Cabot Edition</>,
    s: EDITION_STATUS,
    d: <>A comprehensive edition of Cabot's published books, philosophical manuscripts, letters, poetry, and journals. See <a href={href("Edition")}>the edition page</a> for its scope, the archival work completed, and the editorial approach.</>,
  },
  {
    t: <><em>Ella Lyman Cabot: Purposive Selfhood and the Philosophical Education of Children</em></>,
    s: "Edited volume. Manuscript complete; awaiting the series editors' approval for submission to Routledge. Not yet under contract.",
    d: "Co-edited with Maughn Rollins Gregory and Megan Jane Laverty for the Philosophy for Children Forebears series. The first collection of Cabot's writings on the philosophical education of children, in five parts, each pairing her texts with an original commentary chapter by a contemporary scholar.",
  },
  {
    t: <><em>The Purposive Self: Agency, Normativity, and Moral Growth</em></>,
    s: "Monograph in progress.",
    d: "The systematic side of my work: an account of the self as a purposive achievement, and of that achievement as what makes normativity, responsibility, and moral growth possible. It draws on Cabot's pragmatic idealism and tests it against problems in metaethics, moral responsibility, and the philosophy of education.",
  },
];

function Research() {
  return (
    <div className="sec">
      <h2>Research</h2>
      <Rule />
      <p>My work spans pragmatist ethics and metaethics, feminist philosophy of the late nineteenth and early twentieth centuries, the philosophy of moral education, and moral responsibility. I work at the boundary between historical recovery and systematic philosophy, using archival research to reconstruct positions and arguments that mattered in their time and have since been left out of the received canon.</p>
      <p>The systematic claim running through it is that neither deflationary expressivism nor heavyweight metaphysical realism can account for genuine moral error, responsibility over time, and the possibility of becoming a better person. What is needed is a minimal metaphysics of the purposive self, and Ella Lyman Cabot's pragmatic idealism supplies one.</p>

      <div className="project-list" style={{ marginTop: "2rem" }}>
        {PROJECTS.map((p, i) => (
          <div key={i} className="project-item">
            <div className="project-num">{roman(i + 1)}</div>
            <div>
              <div className="project-title">{p.t}</div>
              <div className="status"><span className="status-label">Status</span> {p.s}</div>
              <div className="project-desc">{p.d}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: "2rem" }}>Articles and talks drawn from these projects are listed under <a href={href("Publications")}>Publications</a>.</p>
    </div>
  );
}

// ── PUBLICATIONS ──────────────────────────────────────────────────
// t: title · cite: the rest of the citation · url: article or publisher page · n: a short note
const PUBLISHED = [
  { t: "Trauma and Diachronic Reasons-Responsive Moral Responsibility", cite: "Philosophy of Medicine 7, no. 1 (October 2026).", url: "https://doi.org/10.5195/pom.2026.284", n: "Open access." },
  { t: "Review of Cheryl Misak, Oxford Pragmatism: Ryle and Austin's Debt (Oxford University Press, 2025)", cite: "Transactions of the Charles S. Peirce Society 62, no. 1 (2026): 74–81.", url: "https://muse.jhu.edu/issue/57270" },
  { t: "Reasonable Communities: P4C and Peace Education", cite: "In Cultivating Reasonableness in Education: Community of Philosophical Inquiry, edited by Marella Ada V. Mancenido-Bolaños, Cathlyne Joy P. Alvarez-Abarejo, and Leander Penaso Marquez. Singapore: Springer, 2023.", url: "https://link.springer.com/book/10.1007/978-981-99-4198-8" },
  { t: "Expanding the Facilitator's Toolbox: Vygotskian Mediation in Philosophy for Children", cite: "With Kevin M. Clark. Analytic Teaching and Philosophical Praxis 40, no. 2 (2020).", url: "https://journal.viterbo.edu/index.php/atpp/article/download/1183/990/1897", n: "Open access (PDF)." },
];
const ACCEPTED = [
  { t: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", cite: "The Pluralist. Accepted.", n: "Winner of the 2026 Harris-Jones Prize, Society for the Advancement of American Philosophy." },
  { t: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", cite: "Philosophy of Education. Forthcoming 2027." },
  { t: "An Organic Pragmatist Synthesis through Ella Lyman Cabot: A Review Essay of Diana Heney's American Ethics (2025)", cite: "The Pluralist. Forthcoming 2027." },
];
const UNDER_REVIEW = [
  { t: "Being the Moral Teacher: Ella Lyman Cabot's Purposive Virtue Ethics", cite: "Revise and resubmit, Journal of Philosophy of Education." },
  { t: "What the Tradition Presupposes: Minimal Metaphysics, Pragmatist-Feminism, and the Case for Centering Ella Lyman Cabot", cite: "Under review." },
  { t: "Rationality as Probabilistic Coherence: Credal Expressivism, Planning Attitudes, and the Guidance of Action", cite: "Under review." },
];
const COMMISSIONED = [
  { t: "\"Love\" and \"Friendship\" (Ralph Waldo Emerson)", cite: "Reference entries for The Literary Encyclopedia. Commissioned; in preparation." },
];
const UPCOMING_TALKS = [
  { t: "Self-Reliance, Loyalty, and American Idealism: Ella Lyman Cabot Between Royce and Emerson", v: "APA Eastern Division, Boston · Josiah Royce Society and Ralph Waldo Emerson Society session (session organizer)", y: "January 2027" },
  { t: "No Moral Equivalent to War: Ella Lyman Cabot's Religious Case Against William James, 1915", v: "APA Eastern Division, Boston · William James Society session", y: "January 2027" },
  { t: "Against the Isolated Self: Ella Lyman Cabot's Ethics of Love and the Collapse of Egoism and Altruism", v: "APA Eastern Division, Boston · SAAP session", y: "January 2027" },
  { t: "Two Orders of Love: Ella Lyman Cabot Versus MacIntyre on the Proper Ordering of Augustinian Virtue", v: "Society of Christian Philosophers, Eastern Regional Meeting, Christopher Newport University", y: "November 2026" },
];
const TALKS = [
  { t: "After Dewey: Ella Lyman Cabot, Owned Obligation, and the Anti-Deficit Child Trilemma", v: "NAAPE", y: "2026" },
  { t: "Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot", v: "SAAP", y: "2026" },
  { t: "Ella Lyman Cabot: Teaching for Royce's Beloved Community", v: "PES", y: "2026" },
  { t: "Expanding the Pragmatist-Feminism Canon: Ella Lyman Cabot, Metaphysics, and Feminist Challenges", v: "Boston University Graduate Conference", y: "2026" },
  { t: "Trauma and Moral Responsibility: Constitutivism, Expressivism, and Idealism", v: "SSPP", y: "2026" },
  { t: "Ella Lyman Cabot: Teaching for the Beloved Community", v: "NEPES", y: "2025" },
  { t: "Being the Moral Teacher: Ella Lyman Cabot's Ideal Theory of Self and Egoist Virtue", v: "NAAPE / SOPHE", y: "2025" },
  { t: "Ella Lyman Cabot: Pioneering Ethics Education for Women's Selfhood", v: "ISEB", y: "2025" },
  { t: "Reasonable Communities: P4C and Peace Education", v: "NAAPE", y: "2023" },
  { t: "What is the ABE Teacher: Three Metaphors for Conceptualizing the Role", v: "IAACE", y: "2023" },
  { t: "Ella Lyman Cabot: The Ethical Educator of Selfhood", v: "NAAPE", y: "2022" },
  { t: "A Pragmatist Metaethics", v: "Indiana University Bicentennial Philosophy Conference", y: "2019" },
];
const AWARDS = [
  { t: "Harris-Jones Prize", y: "2026", d: "Society for the Advancement of American Philosophy. Recognizes work in the philosophy of the Black experience; awarded for \"Pluralism in Practice: Interpreting Black Feminism and Womanism Through Ella Lyman Cabot.\"" },
  { t: "Research Award", y: "2026", d: "Ralph Waldo Emerson Society. Supports archival research in the Papers of Richard Clarke Cabot, Harvard University Archives, on Ella Lyman Cabot's philosophical formation and relation to Emerson." },
  { t: "Outstanding Paper Prize, Finalist", y: "2025", d: "North American Association for Philosophy and Education. For \"Being the Moral Teacher: Ella Lyman Cabot's Ideal Theory of Self and Egoist Virtue.\"" },
];

const Entry = ({ p }) => (
  <div className="pub-item">
    <div className="pub-title">{p.url ? <Ext url={p.url}>{p.t}</Ext> : p.t}</div>
    <div className="pub-meta">{p.cite}</div>
    {p.n && <div className="pub-note">{p.n}</div>}
  </div>
);
const Talk = ({ p }) => (
  <div className="pub-item">
    <div className="pub-title">{p.t}</div>
    <div className="pub-meta">{p.v} &middot; {p.y}</div>
  </div>
);

function Publications() {
  return (
    <div className="sec">
      <h2>Publications &amp; Talks</h2>
      <Rule />
      <p className="small-note" style={{ marginTop: 0 }}>Titles that are linked open the article or the publisher's page. Drafts of work in progress are available on request.</p>

      <div className="pub-sec">
        <div className="sub-label">Published</div>
        {PUBLISHED.map((p, i) => <Entry key={i} p={p} />)}
      </div>

      <div className="pub-sec">
        <div className="sub-label">Accepted &amp; Forthcoming</div>
        {ACCEPTED.map((p, i) => <Entry key={i} p={p} />)}
      </div>

      <div className="pub-sec">
        <div className="sub-label">Under Review</div>
        {UNDER_REVIEW.map((p, i) => <Entry key={i} p={p} />)}
      </div>

      <div className="pub-sec">
        <div className="sub-label">Books &amp; Editions in Preparation</div>
        {PROJECTS.map((p, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{p.t}</div>
            <div className="pub-meta">{p.s}</div>
          </div>
        ))}
        <p className="small-note">Described in more detail under <a href={href("Research")}>Research</a> and <a href={href("Edition")}>Cabot Edition</a>.</p>
      </div>

      <div className="pub-sec">
        <div className="sub-label">Commissioned</div>
        {COMMISSIONED.map((p, i) => <Entry key={i} p={p} />)}
      </div>

      <div className="pub-sec">
        <div className="sub-label">Forthcoming Presentations</div>
        {UPCOMING_TALKS.map((p, i) => <Talk key={i} p={p} />)}
      </div>

      <div className="pub-sec">
        <div className="sub-label">Conference Presentations</div>
        {TALKS.map((p, i) => <Talk key={i} p={p} />)}
      </div>

      <div>
        <div className="sub-label">Awards &amp; Prizes</div>
        {AWARDS.map((a, i) => (
          <div key={i} className="pub-item">
            <div className="pub-title">{a.t} <span style={{ color: C.muted }}>{a.y}</span></div>
            <div className="pub-meta">{a.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TEACHING ──────────────────────────────────────────────────────
const INST = [
  { name: "University of Indianapolis", detail: "Associate Adjunct · Intro to Ethics · Intro to Philosophy · Business Ethics" },
  { name: "Ivy Tech Community College", detail: "Intro to Ethics (18 sections) · Intro to Philosophy" },
  { name: "Purdue University Indianapolis", detail: "Instructor of record, Philosophy" },
  { name: "Park University", detail: "Ancient & Medieval Phil. · Philosophy of Religion · Ethics" },
  { name: "Southern New Hampshire University", detail: "Ethics in Global Society" },
  { name: "Indiana University Kokomo", detail: "Critical Thinking · Elementary Logic" },
  { name: "Colorado Technical University", detail: "Intro to Ethics" },
  { name: "Western Michigan University", detail: "Intro to Philosophy · Ethics in Engineering · Values & Video Games" },
];
// Put files in public/teaching/ and list them here, e.g.
// { t: "Introduction to Philosophy, sample syllabus", file: "teaching/intro-syllabus.pdf" }
const TEACHING_MATERIALS = [];

function Teaching() {
  return (
    <div className="sec">
      <h2>Teaching</h2>
      <Rule />

      <div style={{ marginBottom: "2rem" }}>
        <div className="sub-label">Teaching Philosophy</div>
        <p className="teach-philosophy">My teaching begins with a claim I take from my research: the self is not given but achieved, and that achievement depends on genuine resistance from the world. Students do not become better thinkers by receiving correct views. They become better thinkers by having their views seriously tested. The classroom is where that testing happens.</p>
        <p className="teach-philosophy">My methods draw on Ella Lyman Cabot's pedagogy and the pragmatist tradition of Royce, James, and Dewey. Cabot argued that moral education begins in ordinary experience and grows through interpretation and loyal cooperation, not through the transmission of doctrine. In practice this means the classroom functions as a community of inquiry: a space where students reason together, test their views against genuine resistance, and treat disagreement as philosophically productive.</p>
        <p className="teach-philosophy">In Introduction to Ethics, this becomes a semester-long project. Students begin by generating their own lists of goods, bads, and cases before any theory is introduced. Collaborative reasoning builds toward a working moral framework the class constructs together. When Mill, Kant, and Aristotle enter the conversation, the question is never just what they say but whether their accounts survive contact with what the class has built. This is what Cabot and Royce meant by the Beloved Community: not agreement, but a group that has learned to think and act together while remaining genuinely different from one another.</p>
        <p className="teach-philosophy">The signature assignment in Introduction to Philosophy is the Reading Argument Objection and Reply (RAOR): students reconstruct the central argument of a primary text, raise a serious objection, and develop a reply in the author's defense. The course ends with students returning to their first RAOR with the skills they have developed over the semester. The difference between the two submissions is usually the clearest evidence I have that something real happened.</p>
      </div>

      {TEACHING_MATERIALS.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <div className="sub-label">Course Materials</div>
          {TEACHING_MATERIALS.map((m, i) => (
            <div key={i} className="pub-item">
              <div className="pub-title"><a href={m.file}>{m.t}</a></div>
              {m.n && <div className="pub-note">{m.n}</div>}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginBottom: "1.8rem" }}>
        <div className="sub-label">Institutions (70+ courses at 8 institutions)</div>
        <div className="inst-grid">
          {INST.map((inst, i) => (
            <div key={i} className="inst-item">
              <Dot />
              <div>
                <div className="inst-name">{inst.name}</div>
                <div className="inst-sub">{inst.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="sub-label">Adult Basic Education</div>
        <div className="pub-item" style={{ borderBottom: "none" }}>
          <div className="pub-title">Miami Correctional Facility <span style={{ color: C.muted, fontFamily: SANS, fontSize: "0.8rem", fontWeight: 400 }}>2022–2024</span></div>
          <div className="pub-meta">Adult Basic Education Instructor · Ivy Tech Community College</div>
        </div>
      </div>

      <div className="callout">
        <p>{TEACHING_MATERIALS.length > 0 ? "Further syllabi" : "Syllabi, the RAOR assignment sheet,"} and a full teaching statement are available on request: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. I am interested in developing courses on the history of American ethics, pragmatism, feminist philosophy, and philosophy of education.</p>
      </div>
    </div>
  );
}

// ── CV ────────────────────────────────────────────────────────────
// Built from the same data as the other pages, so it can't drift from them.
const cvLine = p => `${p.cite}${p.n ? " " + p.n : ""}`;
const CV_DATA = [
  { h: "Education", items: [
    { t: "MA in Philosophy", s: "Western Michigan University, 2021 · Concentrations: Epistemology & Philosophy of Science; Ethical Theory & Value Theory" },
    { t: "BA in Humanities; Minor in Philosophy", s: "Indiana University Kokomo, 2019 · 45 philosophy credit hours" },
  ]},
  { h: "Positions", items: [
    { t: "Associate Adjunct in Philosophy", s: "University of Indianapolis" },
    { t: "Independent Scholar; Principal Investigator", s: "Boston Ethics Tradition Recovery Program" },
    { t: "Instructor of Record", s: "Eight institutions · 70+ courses" },
  ]},
  { h: "Published", items: PUBLISHED.map(p => ({ t: p.t, s: cvLine(p), url: p.url })) },
  { h: "Accepted & Forthcoming", items: ACCEPTED.map(p => ({ t: p.t, s: cvLine(p) })) },
  { h: "Under Review", items: UNDER_REVIEW.map(p => ({ t: p.t, s: p.cite })) },
  { h: "Books & Editions in Preparation", items: PROJECTS.map(p => ({ t: p.t, s: p.s })) },
  { h: "Awards & Prizes", items: AWARDS.map(a => ({ t: `${a.t}, ${a.y}`, s: a.d.split(".")[0] })) },
  { h: "Presentations", items: [...UPCOMING_TALKS, ...TALKS].map(p => ({ t: p.t, s: `${p.v}, ${p.y}` })) },
  { h: "Archival Research", items: [
    { t: "Papers of Ella Lyman Cabot (A-139), Schlesinger Library", s: "Digitized and transcribed in full", url: FINDING_AID_ELC },
    { t: "Papers of Richard Clarke Cabot (HUG 4255), Harvard University Archives", s: "About 16,000 photographs; transcription under way", url: FINDING_AID_RCC },
  ]},
  { h: "Teaching", items: INST.map(i => ({ t: i.name, s: i.detail })) },
  { h: "Affiliations", items: [
    { t: "Society for the Advancement of American Philosophy (SAAP)" },
    { t: "Philosophy of Education Society (PES)" },
    { t: "North American Association for Philosophy and Education (NAAPE)" },
    { t: "Northeastern Philosophy and Education Society (NEPES)" },
    { t: "Society of Philosophy and History of Education (SOPHE)" },
    { t: "International Society of Educational Biography (ISEB)" },
    { t: "Southern Society for Philosophy and Psychology (SSPP)" },
    { t: "Indiana Association for Adult and Continuing Education (IAACE)" },
  ]},
];

function CV() {
  return (
    <div className="sec">
      <h2>Curriculum Vitae</h2>
      <Rule />
      <div className="cv-head">
        <div className="cv-dated">Jacob B. Castleberry · {EMAIL} · Updated {CV_UPDATED}</div>
        <div className="cv-actions no-print">
          {CV_PDF && <a href={CV_PDF} className="cv-link" download>Download PDF</a>}
          <button className="cv-link cv-print" onClick={() => window.print()}>{CV_PDF ? "Print" : "Print or save as PDF"}</button>
        </div>
      </div>
      {CV_DATA.map((sec, i) => (
        <div key={i} className="cv-sec">
          <div className="sub-label">{sec.h}</div>
          {sec.items.map((item, j) => (
            <div key={j} className="cv-item">
              <Dot />
              <div>
                <div className="cv-title">{item.url ? <Ext url={item.url}>{item.t}</Ext> : item.t}</div>
                {item.s && <div className="cv-sub">{item.s}</div>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── RESOURCES ────────────────────────────────────────────────────
const Source = ({ r }) => (
  <div className="res-item">
    <div className="res-title">{r.author ? `${r.author}. ` : ""}<em>{r.title}</em>{r.cite ? `. ${r.cite}` : "."}</div>
    {r.url && <div className="res-meta"><Ext url={r.url}>{r.source || "Finding aid"}</Ext></div>}
    {r.note && <div className="res-note">{r.note}</div>}
  </div>
);

function Resources() {
  const [tab, setTab] = useState("primary");
  const TABS = {
    primary:   ["Published Works", "Books by Ella Lyman Cabot and Richard Clarke Cabot, with links to digitized copies where they exist.", PRIMARY],
    archives:  ["Archival Collections", "The two Harvard collections that hold most of the Cabots' unpublished papers, with links to their finding aids.", ARCHIVES],
    secondary: ["Secondary Scholarship", "Scholarship on Ella Lyman Cabot.", SECONDARY],
  };
  const [, hint, list] = TABS[tab];

  return (
    <div className="sec">
      <h2>Cabot Resource Library</h2>
      <Rule />
      <p>A working bibliography for the Boston ethics tradition, with full citations and links to digitized copies and archival finding aids. I add to it as new scholarship appears; corrections and additions are welcome.</p>

      <div style={{ marginTop: "2rem" }}>
        <div className="tab-row" role="tablist">
          {Object.keys(TABS).map(t => (
            <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)} role="tab" aria-selected={tab === t}>
              {TABS[t][0]}
            </button>
          ))}
        </div>
        <p className="res-hint">{hint}</p>
        {list.map((r, i) => <Source key={i} r={r} />)}
      </div>

      <div style={{ marginTop: "2.8rem" }}>
        <div className="sub-label">Boston Ethics Network</div>
        <p>I am in correspondence with a small group of scholars working on the Boston ethics tradition and related questions in American pragmatism, feminist philosophy, and philosophy of education. If you work on any figure in this tradition, write to me at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
      </div>
    </div>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────
function Contact() {
  return (
    <div className="sec">
      <h2>Correspondence</h2>
      <Rule />
      <p>I welcome correspondence about the Cabot edition, the Boston ethics tradition, philosophy of education, and moral responsibility. I am particularly glad to hear from press and series editors in American philosophy and the history of philosophy, and from scholars interested in collaborating on the edition.</p>

      <div style={{ marginTop: "1.7rem" }}>
        {[
          { l: "Email", v: EMAIL, href: `mailto:${EMAIL}` },
          { l: "PhilPeople", v: "Profile and papers", href: PHILPEOPLE, ext: true },
          { l: "Position", v: "Associate Adjunct in Philosophy, University of Indianapolis; independent scholar" },
        ].map((item, i) => (
          <div key={i} className="contact-row">
            <div className="contact-label">{item.l}</div>
            {item.href
              ? <a href={item.href} className="contact-link" {...(item.ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{item.v}</a>
              : <span className="contact-val">{item.v}</span>}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "2.4rem" }}>
        <div className="sub-label">Press &amp; series editors</div>
        <p>I am preparing a comprehensive edition of Ella Lyman Cabot's writings, described on the <a href={href("Edition")}>Cabot Edition</a> page, and a monograph on her philosophy of love. An edited sample, a prospectus, and the current <a href={href("CV")}>CV</a> are available.</p>
      </div>

      <div style={{ marginTop: "1.6rem" }}>
        <div className="sub-label">Scholars in related fields</div>
        <p>I am looking for collaborators on the edition and contributors to the Resource Library. Collaborators can work with unpublished Cabot material by permission of the Ella Lyman Cabot Trust.</p>
      </div>

      <p style={{ marginTop: "1.8rem", fontStyle: "italic" }}>For syllabi, writing samples, or paper drafts, email directly. I usually reply within a week.</p>
    </div>
  );
}

// ── SEO & JSON-LD ─────────────────────────────────────────────────
const META = {
  Home:         ["Jacob B. Castleberry | Philosopher", "Jacob B. Castleberry is a moral philosopher specializing in American pragmatism, feminist philosophy, and recovery of the Boston ethics tradition, including Ella Lyman Cabot (1866–1934)."],
  Edition:      ["The Cabot Edition | Jacob B. Castleberry", "A comprehensive edition of the writings of Ella Lyman Cabot (1866–1934): published books, philosophical manuscripts, letters, poetry, and journals, edited from the Schlesinger Library and Harvard University Archives collections."],
  Research:     ["Research | Jacob B. Castleberry", "Research projects on Ella Lyman Cabot and purposive selfhood: a monograph on Cabot's philosophy of love, a comprehensive edition of her writings, an edited volume, and The Purposive Self."],
  Publications: ["Publications & Talks | Jacob B. Castleberry", "Publications and conference presentations by Jacob B. Castleberry on Ella Lyman Cabot, pragmatist ethics, and philosophy of education."],
  Teaching:     ["Teaching | Jacob B. Castleberry", "Jacob B. Castleberry has taught 70+ courses at eight institutions. Teaching philosophy draws on Cabot, Royce, and the Philosophy for Children tradition."],
  CV:           ["CV | Jacob B. Castleberry", "Curriculum vitae for Jacob B. Castleberry, philosopher and principal investigator of the Boston Ethics Tradition Recovery Program."],
  Resources:    ["Cabot Resource Library | Jacob B. Castleberry", "Primary and secondary sources for the Boston ethics tradition: Ella Lyman Cabot, Richard Clarke Cabot, Ada Peirce McCormick, and related scholars."],
  Contact:      ["Contact | Jacob B. Castleberry", "Contact Jacob B. Castleberry about the ELC recovery project, the Boston Ethics Tradition Recovery Program, or scholarly collaboration."],
};

function useSEO(s) {
  useEffect(() => {
    const [title, desc] = META[s] || META.Home;
    document.title = title;
    const sm = (sel, attr, key, val) => {
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = val;
    };
    sm('meta[name="description"]', "name", "description", desc);
    sm('meta[property="og:title"]', "property", "og:title", title);
    sm('meta[property="og:description"]', "property", "og:description", desc);

    // JSON-LD structured data (home only)
    const existing = document.getElementById("jld-person");
    if (existing) existing.remove();
    if (s === "Home") {
      const script = document.createElement("script");
      script.id = "jld-person";
      script.type = "application/ld+json";
      script.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Jacob B. Castleberry",
        "jobTitle": "Moral Philosopher",
        "affiliation": { "@type": "Organization", "name": "Boston Ethics Tradition Recovery Program" },
        "email": "castleberryj@uindy.edu",
        "alumniOf": [
          { "@type": "CollegeOrUniversity", "name": "Western Michigan University" },
          { "@type": "CollegeOrUniversity", "name": "Indiana University Kokomo" }
        ],
        "knowsAbout": ["American pragmatism","Ella Lyman Cabot","Boston ethics tradition","philosophy of education","metaethics","moral responsibility","feminist philosophy"],
        "award": [
          "Harris-Jones Prize, Society for the Advancement of American Philosophy, 2026",
          "Research Award, Ralph Waldo Emerson Society, 2026"
        ]
      });
      document.head.appendChild(script);
    }
  }, [s]);
}

// ── APP ───────────────────────────────────────────────────────────
const VIEWS = {
  Home:<Home/>, Edition:<Edition/>, Research:<Research/>, Publications:<Publications/>,
  Teaching:<Teaching/>, CV:<CV/>, Resources:<Resources/>, Contact:<Contact/>
};

export default function App() {
  const [active, setActive] = useState(sectionFromHash);
  const [open, setOpen] = useState(false);
  useSEO(active);

  // The address is the source of truth: links set the hash, and this follows it.
  useEffect(() => {
    const onHash = () => {
      if (!isRouteHash(window.location.hash)) return;
      setActive(sectionFromHash());
      setOpen(false);
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function skipToMain(e) {
    e.preventDefault();
    const main = document.getElementById("main");
    if (main) { main.focus(); main.scrollIntoView(); }
  }

  return (
    <div id="site-root">
      <style>{css}</style>

      <a href="#main" className="skip-link" onClick={skipToMain}>Skip to content</a>

      <nav className="nav-wrap" aria-label="Main navigation">
        <div className="nav-inner">
          <a className="nav-logo" href={href("Home")}>Jacob B. Castleberry</a>
          <ul className="nav-links">
            {SECTIONS.filter(s => s !== "Home").map(s => (
              <li key={s}><a className={`nav-btn ${active === s ? "active" : ""}`} href={href(s)} aria-current={active === s ? "page" : undefined}>{label(s)}</a></li>
            ))}
          </ul>
          <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu" aria-expanded={open}>
            <span style={{ transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ opacity: open ? 0 : 1 }} />
            <span style={{ transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </div>
        <div className={`mob-nav ${open ? "open" : ""}`} role="navigation" aria-label="Mobile navigation">
          {SECTIONS.map(s => <a key={s} className={`mob-btn ${active === s ? "active" : ""}`} href={href(s)} aria-current={active === s ? "page" : undefined}>{label(s)}</a>)}
        </div>
      </nav>

      <main id="main" className="page" key={active} tabIndex={-1}>
        {VIEWS[active]}
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p>&copy; {new Date().getFullYear()} Jacob B. Castleberry &nbsp;·&nbsp; {RIGHTS}</p>
          <p className="colophon">Set in EB Garamond &amp; IM Fell English <span className="pilcrow">¶</span> Boston Ethics Tradition Recovery Program</p>
        </div>
      </footer>
    </div>
  );
}
