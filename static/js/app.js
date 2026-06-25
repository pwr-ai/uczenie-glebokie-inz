/* ---------------- i18n ---------------- */
let LANG = "pl";
function applyLang(lang) {
  LANG = lang;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const v = el.getAttribute("data-" + lang);
    if (v != null) el.innerHTML = v;
  });
  document.querySelectorAll("[data-set-lang]").forEach((b) =>
    b.setAttribute("aria-pressed", b.dataset.setLang === lang ? "true" : "false")
  );
  try { localStorage.setItem("ug:lang", lang); } catch (_) {}
}

/* ---------------- arch tabs ---------------- */
function initTabs() {
  const tabs = document.querySelectorAll(".arch-tabs button");
  const panels = document.querySelectorAll(".arch-panel");
  if (!tabs.length) return;
  tabs.forEach((t) =>
    t.addEventListener("click", () => {
      tabs.forEach((x) => x.setAttribute("aria-selected", "false"));
      panels.forEach((p) => p.classList.remove("on"));
      t.setAttribute("aria-selected", "true");
      panels[+t.dataset.tab].classList.add("on");
    })
  );
}

/* ---------------- scrollspy ---------------- */
function initSpy() {
  const links = [...document.querySelectorAll("nav.anchors a")];
  if (!links.length) return;
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const obs = new IntersectionObserver(
    (es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const a = map.get(e.target.id);
          if (a) a.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["wyklady", "laboratoria", "narzedzia", "zespol", "efekty", "literatura"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) obs.observe(el);
  });
}

/* ---------------- mobile menu ---------------- */
function initMenu() {
  const btn = document.getElementById("menuBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const el = document.getElementById("wyklady");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
}

/* ---------------- scroll reveal (staggered per container) ---------------- */
function initReveal() {
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  document.querySelectorAll(".sec-head,.arch,.outcomes").forEach((e) => e.setAttribute("data-reveal", ""));
  [[".block", 70], [".tool", 45], [".person", 80], [".ref", 60]].forEach(([sel, step]) => {
    const byParent = new Map();
    document.querySelectorAll(sel).forEach((el) => {
      el.setAttribute("data-reveal", "");
      const arr = byParent.get(el.parentElement) || [];
      arr.push(el);
      byParent.set(el.parentElement, arr);
    });
    byParent.forEach((arr) => arr.forEach((el, i) => el.style.setProperty("--d", Math.min(i, 9) * step + "ms")));
  });
  const ro = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          ro.unobserve(e.target);
        }
      }),
    { rootMargin: "0px 0px -7% 0px", threshold: 0.06 }
  );
  document.querySelectorAll("[data-reveal]").forEach((e) => ro.observe(e));
}

/* ---------------- boot ---------------- */
initTabs();
initSpy();
initMenu();
initReveal();
document.querySelectorAll("[data-set-lang]").forEach((b) =>
  b.addEventListener("click", () => applyLang(b.dataset.setLang))
);
let saved = "pl";
try { saved = localStorage.getItem("ug:lang") || "pl"; } catch (_) {}
applyLang(saved);
