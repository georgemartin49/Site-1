import { useState, useEffect, useRef } from "react";
import site from "./content/site.json";
import pubData from "./content/publications.json";
import presData from "./content/presentations.json";
import resData from "./content/resources.json";
import cvData from "./content/cv.json";
import sampleFile from "./content/sample.json";

// ── TOKENS ── derived from ELC's actual book bindings ─────────────
// Everyday Ethics (1906): deep wine/burgundy cloth
// Ethics for Children (1910) + Temptations to Rightdoing (1929): dusty slate blue
// All bindings: aged gilt gold lettering on warm cream pages
// Palette (values used in the stylesheet below; contrast ratios measured on cream):
//   cream:    "#f5efe4",  // warm page-cream background
//   creamDark:"#ede4d4",  // slightly darker cream for callouts
//   wine:     "#5c1515",  // Everyday Ethics binding — headings, nav (11.66:1 on cream, AAA)
//   wineDeep: "#4a1010",  // deeper wine for nav (13.37:1 on cream, AAA)
//   wineHover:"#6b1a1a",  // hover state
//   ink:      "#1a1209",  // near-black with warm undertone — body text (16.18:1, AAA)
//   inkSub:   "#3a2a1a",  // warm dark secondary
//   muted:    "#3d2a18",  // warm brown muted text (6.80:1 on cream, AAA)
//   mutedLight:"#4f3c28", // lighter muted (4.55:1 on cream, AA)
//   gold:     "#c9a84c",  // aged gilt — DECORATIVE ONLY, never text (fails contrast as text)
//   slate:    "#3a5a7a",  // dusty slate blue from Ethics for Children (6.28:1, AAA)
//   slateDeep:"#2a4a6a",  // deeper slate for links (8.03:1, AAA)
//   border:   "#d4c9b8",  // warm taupe border
//   borderDark:"#c4b9a8", // darker warm border
//   navCream: "#f0e8d8",  // cream text on wine nav (10.26:1, AAA)
//   navGold:  "#e8c97a",  // gilt gold on wine nav (7.31:1, AAA)
//   newsSlate:"#3a5a7a",  // slate for news strip accent
//   newsBg:   "#edf1f5",  // very light slate tint for news strip
const SERIF   = "'EB Garamond', Georgia, 'Times New Roman', serif";
const LABEL   = "'EB Garamond', Georgia, serif"; // small caps via font-variant-caps
const DISPLAY = "'EB Garamond', Georgia, 'Times New Roman', serif";
const FELL    = "'IM Fell English', Georgia, 'Times New Roman', serif";

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

/* ── CV print / PDF ── */
@page { size: letter; margin: 0.75in; }
@media print {
  .cv-page .page-title { font-size: 20pt !important; }
  .cv-page .sub-label { margin-top: 14pt; border-bottom: 0.5pt solid #999; break-after: avoid; }
  .cv-page .cite { font-size: 10.5pt; line-height: 1.4; padding-top: 2pt; padding-bottom: 2pt; break-inside: avoid; }
  .rule, .text-links { display: none !important; }
  .cv-page .cv-dated { font-size: 10.5pt; margin-bottom: 6pt; }
  .cv-page .cite .links, .cv-page .cite .event-meta, .cv-page .cite .note { font-size: 10pt; color: #333 !important; }
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

/* ── October 2026 revision: measure, headings, accessibility ── */
.page { max-width: 700px; }
p { font-size: 1.125rem; line-height: 1.65; }
p + p { text-indent: 0; }
.page-title {
  font-family: ${DISPLAY}; font-weight: 500; font-style: italic;
  font-size: clamp(1.9rem, 4vw, 2.5rem); line-height: 1.15; letter-spacing: 0;
}
.page-subtitle { font-family: ${DISPLAY}; font-style: italic; font-size: 1.2rem; color: #3d2a18 !important; margin: -1rem 0 1rem; }
h2.section {
  font-size: clamp(1.3rem, 2.6vw, 1.6rem); font-style: italic; font-weight: 500;
  margin: 2.6rem 0 0.8rem;
}
.sub-label { font-style: normal; line-height: 1.4; margin-top: 2.4rem; }
.sub-label:first-child { margin-top: 0; }
.dropcap::first-letter { font-size: 3.6em; }

.masthead { padding: 1.4rem 0 1.8rem; margin-bottom: 2rem; }
.masthead h1 { font-size: clamp(2.5rem, 7vw, 3.8rem); }
.masthead-motto { font-style: italic; }

.text-links { display: flex; flex-wrap: wrap; gap: 0.4rem 1.6rem; margin: 1.4rem 0 2.2rem; }
.text-links a {
  font-family: ${SERIF}; font-size: 1.05rem; color: #5c1515 !important;
  text-decoration: underline; text-decoration-color: #9a7a2a; text-decoration-thickness: 1px; text-underline-offset: 4px; /* 3.5:1 on cream */
}
.text-links a:hover { color: #2a4a6a !important; text-decoration-color: currentColor; }

.badge {
  display: inline-block; font-family: ${LABEL}; font-variant-caps: all-small-caps; letter-spacing: 0.12em;
  font-size: 0.95rem; color: #5c1515 !important; border: 1px solid #c9a84c; padding: 0 0.55em; margin-bottom: 1.2rem;
}
.updated { font-family: ${SERIF}; font-style: italic; font-size: 0.95rem; color: #4f3c28 !important; }
.area-list { padding-left: 1.3rem; margin: 0.6rem 0 1rem; }
.area-list li { font-family: ${SERIF}; font-size: 1.125rem; line-height: 1.6; margin-bottom: 0.45rem; }
.area-list li::marker { color: #9a7a2a; }

.cite { font-family: ${SERIF}; font-size: 1.0625rem; line-height: 1.6; padding: 0.5rem 0 0.5rem 1.6em; text-indent: -1.6em; }
.cite .links { text-indent: 0; display: block; margin-top: 0.15rem; font-size: 0.97rem; }
.cite .links a + a { margin-left: 1rem; }
.cite .note { text-indent: 0; display: block; font-style: italic; color: #3a2a1a !important; font-size: 0.97rem; margin-top: 0.1rem; }
.event-meta { display: block; text-indent: 0; color: #3a2a1a !important; font-size: 0.97rem; }

/* Footer */
.footer-inner { gap: 0; }

/* Focus and motion */
a:focus-visible, button:focus-visible, [tabindex]:focus-visible { outline: 2px solid #2a4a6a; outline-offset: 3px; }
.nav-wrap a:focus-visible, .nav-wrap button:focus-visible { outline: 2px solid #e8c97a; outline-offset: -2px; }
.footer a:focus-visible { outline-color: #e8c97a; } /* 9:1 on the footer */
.skip-link:focus { outline: 2px solid #2a4a6a !important; outline-offset: 2px; }
main:focus, main:focus-visible { outline: none; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition: none !important; animation: none !important; scroll-behavior: auto !important; }
}

/* Sample */
.sample-grid { display: grid; gap: 1.6rem; }
@media (min-width: 900px) { .sample-grid.has-image { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } }
.sample-figure img { width: 100%; height: auto; border: 1px solid #d4c9b8; }
.sample-figure figcaption { font-size: 0.92rem; font-style: italic; margin-top: 0.4rem; }
.sample-text p { font-size: 1.0625rem; }
.sample-text-label { font-family: ${LABEL}; font-variant-caps: all-small-caps; letter-spacing: 0.12em; color: #5c1515; }
dl.facts { display: grid; grid-template-columns: max-content 1fr; gap: 0.3rem 1.2rem; font-family: ${SERIF}; font-size: 1rem; }
dl.facts dt { font-variant-caps: all-small-caps; letter-spacing: 0.1em; color: #5c1515; }
@media (max-width: 640px) { dl.facts { grid-template-columns: 1fr; } dl.facts dd { margin-bottom: 0.4rem; } }

.news-strip h2 {
  text-align: center; color: #5c1515 !important; font-family: ${LABEL}; font-style: normal;
  font-variant-caps: all-small-caps; letter-spacing: 0.32em; padding-left: 0.32em;
  font-size: 1rem; font-weight: 500; margin-bottom: 0.7rem;
}
.news-text { font-size: 1.0625rem; }
.news-date { min-width: 7.2em; }
@media (max-width: 640px) { .news-item { flex-direction: column; gap: 0; } }
`;

// ── CONTENT ── lives in src/content/*.json; see docs/EDITING.md ────
const { publications: PUBS, projects: PROJECTS, commissioned: COMMISSIONED, awards: AWARDS } = pubData;
const PRESENTATIONS = presData.presentations;

// ── ROUTING ── real paths; scripts/postbuild.js writes a page for each ──
// Only an explicitly enabled sample is published; postbuild.js refuses to build with a draft present.
const SAMPLE = sampleFile && sampleFile.enabled === true ? sampleFile : null;
const ROUTES = SAMPLE ? [...site.routes, site.sampleRoute] : site.routes;
const NOT_FOUND = { id: "notfound", path: null, title: "Page not found | Jacob B. Castleberry", description: "This page could not be found." };
const pathOf = id => ROUTES.find(r => r.id === id).path;
function routeFromLocation() {
  let p = window.location.pathname.replace(/index\.html$/, "");
  if (!p.endsWith("/")) p += "/";
  return ROUTES.find(r => r.path === p) || NOT_FOUND;
}
function navigate(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
// An in-site link: a real href (works with new tabs, copying, crawlers) that navigates without a reload.
function A({ to, children, className, ...rest }) {
  const path = pathOf(to);
  const onClick = e => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(path);
  };
  return <a href={path} onClick={onClick} className={className} {...rest}>{children}</a>;
}
const Ext = ({ url, children }) => <a href={url} target="_blank" rel="noopener noreferrer">{children}</a>;

// "*text*" in content strings is set in italics.
function rich(s) {
  return String(s).split(/(\*[^*]+\*)/).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? <em key={i}>{part.slice(1, -1)}</em> : part);
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const dateLabel = d => (d.length >= 7 ? `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}` : d);

// ── PRIMITIVES ────────────────────────────────────────────────────
const Rule = () => <div className="rule" />;
const PageTitle = ({ children }) => <><h1 className="page-title">{children}</h1><Rule /></>;
const Links = ({ children }) => <nav className="text-links" aria-label="Related pages">{children}</nav>;
const LinkList = ({ links }) => links && links.length > 0 && (
  <span className="links">{links.map((l, i) => <Ext key={i} url={l.url}>{l.label}</Ext>)}</span>
);

// ── CITATIONS ── built from one record per item ────────────────────
// Authors end in an initial ("Castleberry, Jacob B."), so don't add a second period.
const who = a => (a.endsWith(".") ? a : `${a}.`);
function citation(p) {
  const vol = p.volume ? ` ${p.volume}${p.issue ? `, no. ${p.issue}` : ""}` : "";
  const pages = p.pages ? `: ${p.pages}` : "";
  if (p.status !== "published") {
    return <>“{p.title}.” <em>{p.venue}</em>{p.expected ? `, forthcoming ${p.expected}.` : "."}</>;
  }
  if (p.kind === "chapter") {
    return <>{who(p.authors)} “{p.title}.” In <em>{p.book}</em>, edited by {p.editors}, {p.pages}. {p.publisher}, {p.year}.</>;
  }
  if (p.kind === "review") {
    return <>{who(p.authors)} Review of {p.reviewOf}, <em>{p.reviewedTitle}</em>. <em>{p.venue}</em>{vol} ({p.year}){pages}.</>;
  }
  return <>{who(p.authors)} “{p.title}.” <em>{p.venue}</em>{vol} ({p.year}){pages}.{p.doi && <> <Ext url={`https://doi.org/${p.doi}`}>{`https://doi.org/${p.doi}`}</Ext>.</>}</>;
}
const Pub = ({ p }) => (
  <div className="cite">
    {citation(p)}
    {p.note && <span className="note">{p.note}</span>}
    <LinkList links={p.links} />
  </div>
);
const Talk = ({ t }) => (
  <div className="cite">
    “{t.title}.”
    <span className="event-meta">{[t.event, t.session].filter(Boolean).join(", ")}. {t.label || dateLabel(t.date)}.{t.role ? ` ${t.role}.` : ""}</span>
  </div>
);

// Accepted talks stay listed as accepted, including after their month has
// passed, until they are marked delivered. The build flags past ones for review.
const acceptedTalks = () => PRESENTATIONS.filter(t => t.status === "accepted").sort((a, b) => a.date.localeCompare(b.date));
const pastTalks = () => PRESENTATIONS.filter(t => t.status === "delivered").sort((a, b) => b.date.localeCompare(a.date));

// ── HOME ──────────────────────────────────────────────────────────
function Notice({ n }) {
  if (n.publication) {
    const p = PUBS.find(x => x.id === n.publication);
    const verb = p.status === "published" ? "has been published in" : "is forthcoming in";
    const link = p.links && p.links[0];
    return <>My article “{p.title}” {verb} <em>{p.venue}</em>.{link && <> <Ext url={link.url}>Read the article</Ext>.</>}</>;
  }
  return rich(n.text);
}

function Home() {
  return (
    <div className="sec">
      <header className="masthead">
        <h1>Jacob B. Castleberry</h1>
        <p className="masthead-motto">American philosophy, ethics, and philosophy of education</p>
        <div className="masthead-rule" />
      </header>

      <p className="dropcap">I am an independent scholar and Associate Adjunct in Philosophy at the University of Indianapolis. My research examines love, individuality, moral obligation, and education in American philosophy, with particular attention to Ella Lyman Cabot.</p>
      <p>Since 2020, I have been researching Cabot's published and unpublished writings. I am developing a comprehensive critical edition of her surviving work, including books, philosophical manuscripts, correspondence, poetry, and notebooks. My research also includes a monograph on her philosophy of love and studies of moral responsibility and philosophical education.</p>

      <Links>
        <A to="edition">Explore the Cabot edition</A>
        <A to="publications">Read my publications</A>
        <A to="cv">View my CV</A>
      </Links>

      <section className="news-strip" aria-labelledby="recent-work">
        <h2 id="recent-work">Recent work</h2>
        {site.notices.map((n, i) => (
          <div key={i} className="news-item">
            <span className="news-date">{n.label}</span>
            <span className="news-text"><Notice n={n} /></span>
          </div>
        ))}
      </section>
      <p><A to="publications">Publications and presentations</A></p>
    </div>
  );
}

// ── CABOT EDITION ─────────────────────────────────────────────────
function Edition() {
  return (
    <div className="sec">
      <PageTitle>Ella Lyman Cabot Critical Edition</PageTitle>
      <p className="page-subtitle">A comprehensive edition of her surviving writings</p>
      <div className="badge">Project in development</div>

      <p>I am developing a coordinated, multivolume critical edition of Ella Lyman Cabot's surviving writings. The proposed edition encompasses her published books, unpublished philosophical manuscripts, correspondence, poetry, notebooks, and other surviving writings. It will provide edited texts, introductions, annotations, and an account of the decisions made in establishing each text.</p>
      <p>Cabot's writings examine love, individuality, moral growth, and education within the intellectual setting of American idealism and pragmatism. Reading across her philosophical, educational, personal, and literary work would allow scholars to examine how her ideas developed and how she applied them in different forms of writing.</p>

      <h2 className="section">Scope and arrangement</h2>
      <p>The edition aims to include the complete surviving corpus. The number of volumes and their arrangement remain in development. I am organizing the material into the following areas while assessing relationships among texts and the needs of each volume.</p>
      <ul className="area-list">
        <li>Published books and essays, with introductions and textual notes.</li>
        <li>Unpublished philosophical manuscripts, including drafts, notes, and academic writings.</li>
        <li>Correspondence, with identification of correspondents and contextual annotation.</li>
        <li>Poetry, including surviving collections, drafts, and variants.</li>
        <li>Notebooks, journals, and other surviving writings, with their original sequence documented where it can be established.</li>
      </ul>
      <p>These areas describe the intended coverage. Individual areas may require several volumes, and some materials may be grouped together. The arrangement will develop from a fuller inventory of the surviving documents.</p>

      <h2 className="section">Archival work</h2>
      <p className="updated">Progress updated {site.editionProgressUpdated}</p>
      <p>I began researching Cabot in 2020. I have reviewed and transcribed all of the Ella Lyman Cabot Papers at the Schlesinger Library. This work provides the basis for preparing the texts of the edition.</p>
      <p>My work in the Richard Clarke Cabot Papers at Harvard University Archives includes approximately 16,000 photographs. Roughly 7,000 of those photographed pages already have transcriptions. Continuing work examines correspondence, shared reading, philosophical formation, and Ada Peirce McCormick's unpublished biographical drafts.</p>
      <p>These materials support the preparation of the edition. Each text will require checking against its source and documentation of its transcription and editorial history.</p>
      <Links><A to="resources">Archival collections and research resources</A></Links>

      <h2 className="section">Editorial approach</h2>
      <p>I plan to document the source of each text, distinguish authorial revisions from editorial changes, and explain how uncertain readings have been handled. Introductions will describe a work's composition, surviving versions, and relevant historical context. Annotations will identify references and people and explain passages that require additional context.</p>
      <p>The editorial policy is being developed alongside the inventory and sample texts. Decisions about spelling, punctuation, abbreviations, deletions, additions, and variant readings will be stated explicitly so that readers can understand the relationship between the edited text and its sources.</p>

      {SAMPLE && <>
        <h2 className="section">Sample text</h2>
        <p>{SAMPLE.title}, edited with its source description, editorial note, and annotations.</p>
        <Links><A to="sample">Read the sample text</A></Links>
      </>}

      <h2 className="section">Current development</h2>
      <p>The project is in editorial and publication planning. I welcome conversations with publishers, textual scholars, and researchers whose work relates to Cabot, American philosophy, correspondence, or literary editing.</p>
      <Links><A to="contact">Contact me about the edition</A></Links>
    </div>
  );
}

// ── EDITION SAMPLE ── shown only when src/content/sample.json holds an authentic, edited text ──
function sampleCitation(s) {
  const c = s.citation;
  return `${c.author}. "${c.documentTitle}." ${c.date}. Edited by ${c.editor}. ${c.project}. ${c.identifier}. ${site.origin}${site.sampleRoute.path}. Version of ${s.versionDate}.`;
}
function Sample() {
  const s = SAMPLE;
  return (
    <div className="sec">
      <PageTitle>{s.title}</PageTitle>
      <p className="page-subtitle">{s.date}</p>
      <dl className="facts">
        <dt>Document</dt><dd>{s.description}</dd>
        <dt>Archive</dt><dd>{s.archive}</dd>
        <dt>Identifier</dt><dd>{s.identifier}</dd>
      </dl>
      <div className={`sample-grid ${s.image ? "has-image" : ""}`} style={{ marginTop: "1.6rem" }}>
        {s.image && (
          <figure className="sample-figure">
            <img src={s.image.src} width={s.image.width} height={s.image.height} alt={s.image.alt} loading="lazy" />
            <figcaption><a href={s.image.full || s.image.src}>Enlarge image</a>. {s.image.credit}</figcaption>
          </figure>
        )}
        <div className="sample-text">
          <div className="sample-text-label">{s.textLabel}</div>
          {s.text.map((t, i) => <p key={i}>{t}</p>)}
        </div>
      </div>
      <h2 className="section">Editorial note</h2>
      {s.editorialNote.map((t, i) => <p key={i}>{t}</p>)}
      {s.annotations && s.annotations.length > 0 && <>
        <h2 className="section">Annotations</h2>
        <ol className="area-list">{s.annotations.map((a, i) => <li key={i}><strong>{a.ref}</strong> {a.note}</li>)}</ol>
      </>}
      <h2 className="section">How to cite</h2>
      <p>{sampleCitation(s)}</p>
      <p className="updated">{s.reproductionCredit} Version of {s.versionDate}.</p>
      <Links><A to="edition">About the edition</A></Links>
    </div>
  );
}

// ── RESEARCH ──────────────────────────────────────────────────────
function Research() {
  const trauma = PUBS.find(p => p.id === "trauma");
  return (
    <div className="sec">
      <PageTitle>Research</PageTitle>
      <p>My work concerns American philosophy, ethics, and philosophy of education. I study how accounts of selfhood, love, and moral growth explain our obligations to one another. Archival research on Ella Lyman Cabot informs much of this work.</p>

      <h2 className="section">Ella Lyman Cabot and the philosophy of love</h2>
      <p>My monograph in development, <em>An Untold American Philosophy of Love: Ella Lyman Cabot on Becoming Ourselves</em>, reconstructs Cabot's philosophy and develops its account of love as a basis for moral obligation. It examines how individuality takes shape through purposes, relationships, and moral growth, and how this account bears on the claims others make upon us.</p>
      <p>The monograph develops an interpretation and philosophical argument. The comprehensive critical edition provides the texts and documentation on which further research can build. A separate anthology for the Philosophy for Children Forebears project focuses on Cabot's contribution to philosophical education.</p>
      <Links><A to="edition">Cabot Edition</A><A to="publications">Publications and editorial projects</A></Links>

      <h2 className="section">Purposive selfhood</h2>
      <p>My book in progress, <em>The Purposive Self: Agency, Normativity, and Moral Growth</em>, develops a systematic account of purposive selfhood as the ground of normativity and moral growth. It draws on Ella Lyman Cabot's pragmatic idealism and tests that account against problems in metaethics, moral responsibility, and philosophy of education.</p>

      <h2 className="section">The Boston ethics tradition</h2>
      <p>I use “the Boston ethics tradition” to describe the network I am reconstructing around George Herbert Palmer, Josiah Royce, Ella Lyman Cabot, and Richard Clarke Cabot. I examine their connections through teaching, correspondence, shared reading, and work on moral education.</p>
      <p>My research asks how their accounts of selfhood, purpose, and moral growth shaped their understandings of ethical life. The Boston Ethics Tradition Recovery Program is the name I use for this continuing research and editorial work.</p>

      <h2 className="section">Moral responsibility</h2>
      <p>My work on moral responsibility examines how changes in a person's circumstances and experience affect their ability to recognize and respond to reasons. In “{trauma.title},” I develop distinctions among trauma-related disruptions relevant to assessments of responsibility.</p>
      <Links><Ext url={trauma.links[0].url}>Read the article in <em>{trauma.venue}</em></Ext></Links>

      <h2 className="section">Philosophy of education</h2>
      <p>I study moral education and philosophical inquiry, including Cabot's educational writings and the practice of Philosophy for Children. This research connects historical questions about individuality and growth with questions about teaching, interpretation, and participation in a community of inquiry.</p>
      <Links><A to="teaching">Teaching</A><A to="publications">Publications</A></Links>
    </div>
  );
}

// ── PUBLICATIONS ──────────────────────────────────────────────────
function Publications() {
  const published = PUBS.filter(p => p.status === "published");
  const accepted = acceptedTalks();
  return (
    <div className="sec">
      <PageTitle>Publications and presentations</PageTitle>

      <h2 className="sub-label">Published articles and chapters</h2>
      {published.filter(p => p.kind !== "review").map(p => <Pub key={p.id} p={p} />)}

      <h2 className="sub-label">Published reviews</h2>
      {published.filter(p => p.kind === "review").map(p => <Pub key={p.id} p={p} />)}

      <h2 className="sub-label">Forthcoming</h2>
      {PUBS.filter(p => p.status === "forthcoming").map(p => <Pub key={p.id} p={p} />)}

      <h2 className="sub-label">Books and editorial projects</h2>
      {PROJECTS.map(p => (
        <div key={p.id} className="cite">
          {p.italic ? <em>{p.title}</em> : p.title}. {p.status}
          {p.route && <span className="links"><A to={p.route}>{p.routeLabel}</A></span>}
        </div>
      ))}

      <h2 className="sub-label">Commissioned contributions</h2>
      {COMMISSIONED.map((c, i) => <div key={i} className="cite">{c.title}. <em>{c.venue}</em>. {c.status}</div>)}

      {accepted.length > 0 && <>
        <h2 className="sub-label">Accepted presentations</h2>
        {accepted.map((t, i) => <Talk key={i} t={t} />)}
      </>}

      <h2 className="sub-label">Selected past presentations</h2>
      {pastTalks().map((t, i) => <Talk key={i} t={t} />)}

      <h2 className="sub-label">Awards</h2>
      {AWARDS.map((a, i) => (
        <div key={i} className="cite">{a.title}, {a.body}, {a.year}.<span className="note">{a.detail}</span></div>
      ))}
    </div>
  );
}

// ── TEACHING ──────────────────────────────────────────────────────
function Teaching() {
  const t = site.teaching;
  return (
    <div className="sec">
      <PageTitle>Teaching</PageTitle>
      <p>I teach introductory philosophy, ethics, logic, and applied ethics, as well as Ancient and Medieval Philosophy. My teaching asks students to reconstruct arguments, develop objections, and explain the reasons for their judgments.</p>

      <h2 className="section">Reading and argument</h2>
      <p>One recurring assignment asks students to reconstruct an author's argument, raise an objection, and develop a reply. I use feedback and opportunities for revision to help students distinguish an interpretation of a text from their own assessment of its argument. Returning to an early assignment later in the semester gives students a way to examine changes in their reasoning.</p>

      <h2 className="section">Collaborative ethical inquiry</h2>
      <p>In introductory ethics, I have asked students to develop a class moral theory, test it against difficult cases, and compare it with established philosophical accounts. Individual responses allow students to explain where they agree with the class position and where they dissent.</p>

      <h2 className="section">Teaching experience</h2>
      <p>As of {t.asOf}, I have served as instructor of record for {t.courses} courses across {t.institutions} institutions. My experience includes universities and community colleges, with courses in introductory philosophy, moral theory, reasoning, and professional ethics. I also taught adult basic education at Miami Correctional Facility from summer 2022 to summer 2024 through Ivy Tech Community College.</p>
      <Links><A to="cv">View teaching appointments and education in my CV</A></Links>
    </div>
  );
}

// ── CV ────────────────────────────────────────────────────────────
function CV() {
  const { pdf, updated } = site.cv;
  const accepted = acceptedTalks();
  const delivered = pastTalks();
  const love = PROJECTS.find(p => p.id === "love-book");
  return (
    <div className="sec cv-page">
      <PageTitle>Curriculum vitae</PageTitle>
      <p className="cv-dated">Jacob B. Castleberry · <a href={`mailto:${site.email}`}>{site.email}</a> · jacobcastleberry.org · Updated {updated}</p>
      <p className="no-print">My CV includes education, publications, editorial work, archival research, teaching experience, presentations, and professional activities.</p>
      {pdf && <Links><a href={`/${pdf}`} download>Download CV as PDF</a></Links>}

      <h2 className="sub-label">Research</h2>
      <div className="cite">{cvData.interests}</div>
      <div className="cite">Monograph in development: <em>{love.title}</em>. {love.summary}</div>

      <h2 className="sub-label">Education</h2>
      {cvData.education.map((e, i) => <div key={i} className="cite">{e}</div>)}

      <h2 className="sub-label">Honors and awards</h2>
      {AWARDS.map((a, i) => <div key={i} className="cite">{a.title}, {a.body}, {a.year}.</div>)}

      <h2 className="sub-label">Published work</h2>
      {PUBS.filter(p => p.status === "published").map(p => <Pub key={p.id} p={p} />)}

      <h2 className="sub-label">Forthcoming work</h2>
      {PUBS.filter(p => p.status !== "published").map(p => <Pub key={p.id} p={p} />)}

      <h2 className="sub-label">Editorial work and commissioned contributions</h2>
      {PROJECTS.filter(p => p.id !== "love-book").map(p => <div key={p.id} className="cite">{p.italic ? <em>{p.title}</em> : p.title}. {p.status}</div>)}
      {COMMISSIONED.map((c, i) => <div key={i} className="cite">{c.title}. <em>{c.venue}</em>. {c.status}</div>)}

      <h2 className="sub-label">Manuscripts in review and revision</h2>
      {cvData.inReview.map((m, i) => <div key={i} className="cite">“{m.title}.” <em>{m.venue}</em>. {m.status}</div>)}

      <h2 className="sub-label">Selected work in progress</h2>
      {cvData.inProgress.map((m, i) => <div key={i} className="cite">“{m.title}.” {m.status}</div>)}

      <h2 className="sub-label">Archival research</h2>
      {cvData.archives.map((a, i) => <div key={i} className="cite">{a}</div>)}

      {accepted.length > 0 && <>
        <h2 className="sub-label">Accepted presentations</h2>
        {accepted.map((t, i) => <Talk key={i} t={t} />)}
      </>}

      <h2 className="sub-label">Selected presentations delivered</h2>
      {delivered.map((t, i) => <Talk key={i} t={t} />)}

      <h2 className="sub-label">Teaching experience</h2>
      {cvData.appointments.map((a, i) => <div key={i} className="cite">{a}</div>)}
      <div className="cite">Instructor of record for {site.teaching.courses} courses across {site.teaching.institutions} institutions, as of {site.teaching.asOf}: {cvData.institutions.join(", ")}.</div>
      <div className="cite">Selected courses: {cvData.courses}</div>
      <div className="cite">{cvData.abe}</div>

      <h2 className="sub-label">Selected professional affiliations</h2>
      <div className="cite">{cvData.affiliations.join("; ")}.</div>
    </div>
  );
}

// ── RESOURCES ────────────────────────────────────────────────────
const byAuthor = list => [...list].sort((a, b) => (a.sort || a.author).localeCompare(b.sort || b.author) || (a.year || 0) - (b.year || 0));
function Resource({ r, showAuthor = true }) {
  const title = r.quoted ? <>“{r.title}.”</> : r.italic === false ? <>{r.title}.</> : <><em>{r.title}</em>.</>;
  return (
    <div className="cite">
      {showAuthor && <>{r.author}. </>}{title}{r.details ? <> {rich(r.details)}</> : null}
      {r.note && <span className="note">{r.note}</span>}
      <LinkList links={r.links} />
    </div>
  );
}

function Resources() {
  return (
    <div className="sec">
      <PageTitle>Research resources</PageTitle>
      <p>This page brings together archival collections, primary texts, and scholarship relevant to Ella Lyman Cabot and the history of American ethics.</p>

      <h2 className="section">Archival collections</h2>
      {resData.archives.map((r, i) => <Resource key={i} r={r} showAuthor={false} />)}

      <h2 className="section">Primary texts</h2>
      <p>Published writings by Ella Lyman Cabot and related authors are listed below with links to available editions or catalog records.</p>
      {byAuthor(resData.primary).map((r, i) => <Resource key={i} r={r} />)}

      <h2 className="section">Scholarship</h2>
      <p>The works below offer historical and philosophical studies of Cabot and related traditions. My own publications are collected on the <A to="publications">Publications</A> page.</p>
      {byAuthor(resData.scholarship).map((r, i) => <Resource key={i} r={r} />)}
    </div>
  );
}

// ── CONTACT ───────────────────────────────────────────────────────
function Contact() {
  return (
    <div className="sec">
      <PageTitle>Contact</PageTitle>
      <p>I welcome correspondence about Ella Lyman Cabot, American philosophy, moral education, and the comprehensive critical edition of Cabot's surviving writings. I am also glad to hear from publishers and scholars interested in related editorial work.</p>
      <div style={{ marginTop: "1.4rem" }}>
        <div className="contact-row">
          <div className="contact-label">Email</div>
          <a href={`mailto:${site.email}`} className="contact-link">{site.email}</a>
        </div>
        <div className="contact-row">
          <div className="contact-label">ORCID</div>
          <Ext url={site.orcid}>{site.orcid.replace("https://", "")}</Ext>
        </div>
      </div>
      <p style={{ marginTop: "1.4rem" }}>For questions about the edition, please include the material or aspect of the project that interests you.</p>
      <Links><A to="edition">Cabot Edition</A><A to="publications">Publications</A><A to="cv">CV</A></Links>
    </div>
  );
}

function NotFound() {
  return (
    <div className="sec">
      <PageTitle>Page not found</PageTitle>
      <p>There is no page at this address. It may have moved when the site was reorganized.</p>
      <Links><A to="home">Home</A><A to="edition">Cabot Edition</A><A to="publications">Publications</A><A to="contact">Contact</A></Links>
    </div>
  );
}

// ── SEO ── per-route title, description, canonical; JSON-LD on the home page ──
function useSEO(route) {
  useEffect(() => {
    document.title = route.title;
    const set = (sel, make, attr, val) => {
      let el = document.head.querySelector(sel);
      if (!el) { el = make(); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    const meta = (key, prop = "name") => () => { const m = document.createElement("meta"); m.setAttribute(prop, key); return m; };
    set('meta[name="description"]', meta("description"), "content", route.description);
    set('meta[property="og:title"]', meta("og:title", "property"), "content", route.title);
    set('meta[property="og:description"]', meta("og:description", "property"), "content", route.description);
    const canonical = document.head.querySelector('link[rel="canonical"]');
    const robots = document.head.querySelector('meta[name="robots"]');
    if (route.path) {
      set('link[rel="canonical"]', () => { const l = document.createElement("link"); l.rel = "canonical"; return l; }, "href", site.origin + route.path);
      set('meta[property="og:url"]', meta("og:url", "property"), "content", site.origin + route.path);
      if (robots) robots.remove();
    } else {
      if (canonical) canonical.remove();
      set('meta[name="robots"]', meta("robots"), "content", "noindex");
    }

    const old = document.getElementById("jld-person");
    if (old) old.remove();
    if (route.id === "home") {
      const s = document.createElement("script");
      s.id = "jld-person"; s.type = "application/ld+json";
      s.text = JSON.stringify({
        "@context": "https://schema.org", "@type": "Person",
        name: site.name, url: site.origin + "/", email: site.email, sameAs: [site.orcid],
        jobTitle: "Associate Adjunct in Philosophy",
        worksFor: { "@type": "CollegeOrUniversity", name: "University of Indianapolis" },
        alumniOf: [{ "@type": "CollegeOrUniversity", name: "Western Michigan University" }, { "@type": "CollegeOrUniversity", name: "Indiana University Kokomo" }],
        knowsAbout: ["American philosophy", "Ella Lyman Cabot", "ethics", "philosophy of education", "moral responsibility"],
      });
      document.head.appendChild(s);
    }
  }, [route]);
}

// ── APP ───────────────────────────────────────────────────────────
const VIEWS = { home: Home, edition: Edition, sample: Sample, research: Research, publications: Publications, teaching: Teaching, cv: CV, resources: Resources, contact: Contact, notfound: NotFound };
const NAV = site.routes.filter(r => r.id !== "home");

export default function App() {
  const [route, setRoute] = useState(routeFromLocation);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const mainRef = useRef(null);
  const first = useRef(true);
  useSEO(route);

  useEffect(() => {
    const onPop = () => { setRoute(routeFromLocation()); setOpen(false); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // After an in-site navigation, start at the top and move focus to the new page.
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    window.scrollTo(0, 0);
    if (mainRef.current) mainRef.current.focus({ preventScroll: true });
  }, [route]);

  // Escape closes the mobile menu and returns focus to its button.
  useEffect(() => {
    if (!open) return;
    const onKey = e => { if (e.key === "Escape") { setOpen(false); toggleRef.current && toggleRef.current.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function skipToMain(e) {
    e.preventDefault();
    if (mainRef.current) { mainRef.current.focus(); mainRef.current.scrollIntoView(); }
  }

  const current = id => (route.id === id || (id === "edition" && route.id === "sample") ? "page" : undefined);
  const View = VIEWS[route.id];

  return (
    <div id="site-root">
      <style>{css}</style>
      <a href="#main" className="skip-link" onClick={skipToMain}>Skip to content</a>

      <header className="nav-wrap">
        <nav className="nav-inner" aria-label="Main">
          <A to="home" className="nav-logo" aria-current={current("home")}>Jacob B. Castleberry</A>
          <ul className="nav-links">
            {NAV.map(r => (
              <li key={r.id}><A to={r.id} className={`nav-btn ${current(r.id) ? "active" : ""}`} aria-current={current(r.id)}>{r.nav}</A></li>
            ))}
          </ul>
          <button ref={toggleRef} className="hamburger" onClick={() => setOpen(o => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav">
            <span style={{ transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
            <span style={{ opacity: open ? 0 : 1 }} />
            <span style={{ transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
          </button>
        </nav>
        <nav id="mobile-nav" className={`mob-nav ${open ? "open" : ""}`} aria-label="Main (mobile)" hidden={!open}>
          {site.routes.map(r => (
            <A key={r.id} to={r.id} className={`mob-btn ${current(r.id) ? "active" : ""}`} aria-current={current(r.id)}>{r.id === "home" ? "Home" : r.nav}</A>
          ))}
        </nav>
      </header>

      <main id="main" ref={mainRef} className="page" tabIndex={-1} key={route.id}>
        <View />
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <p>&copy; {new Date().getFullYear()} Jacob B. Castleberry. <A to="contact">Contact</A>.</p>
        </div>
      </footer>
    </div>
  );
}
