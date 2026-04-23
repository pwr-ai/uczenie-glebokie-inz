// ===== Lucide icons =====
if (window.lucide) window.lucide.createIcons();

// ===== Tooltips (data-tip="...") — anchored to element, with arrow =====
(function tooltips() {
  const tip = document.getElementById("tip");
  if (!tip) return;
  const body = tip.querySelector(".tip-body");
  const arrow = tip.querySelector(".tip-arrow");
  if (!body || !arrow) return;

  let currentEl = null;

  function show(el) {
    if (currentEl === el) return;
    currentEl = el;
    body.textContent = el.getAttribute("data-tip");
    requestAnimationFrame(() => place(el));
  }

  function hide() {
    currentEl = null;
    tip.classList.remove("is-visible");
  }

  function place(el) {
    const anchor = el.getBoundingClientRect();
    tip.style.left = "0px";
    tip.style.top = "0px";
    const r = tip.getBoundingClientRect();

    const GAP = 10;
    const spaceAbove = anchor.top;
    const spaceBelow = window.innerHeight - anchor.bottom;
    const placement =
      spaceBelow >= r.height + GAP + 8 || spaceBelow >= spaceAbove
        ? "bottom"
        : "top";
    tip.dataset.placement = placement;

    let top = placement === "bottom" ? anchor.bottom + GAP : anchor.top - r.height - GAP;
    let left = anchor.left + anchor.width / 2 - r.width / 2;

    const margin = 8;
    left = Math.max(margin, Math.min(left, window.innerWidth - r.width - margin));

    tip.style.left = left + "px";
    tip.style.top = top + "px";

    const arrowX = Math.max(12, Math.min(anchor.left + anchor.width / 2 - left, r.width - 12));
    arrow.style.left = arrowX - 4.5 + "px";

    tip.classList.add("is-visible");
  }

  document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-tip]");
    if (!el) return;
    show(el);
  });
  document.addEventListener("mouseout", (e) => {
    const el = e.target.closest("[data-tip]");
    if (!el) return;
    const next = e.relatedTarget;
    if (next && el.contains(next)) return;
    hide();
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest && e.target.closest("[data-tip]");
    if (el) show(el);
  });
  document.addEventListener("focusout", hide);
  window.addEventListener("scroll", hide, { passive: true });
  window.addEventListener("resize", hide);
})();

// ===== Theme toggle =====
(function themeToggle() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (_) {}
  });
})();

// ===== Scroll-spy nav highlight =====
(function scrollSpy() {
  const links = document.querySelectorAll(".nav-link");
  const indicator = document.getElementById("nav-indicator");
  if (!links.length) return;

  const sections = ["architektury", "wyklady", "laboratoria", "zespol", "informacje"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const linkMap = new Map();
  links.forEach((a) => linkMap.set(a.dataset.nav, a));

  let current = null;

  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach((a) => {
      const on = a.dataset.nav === id;
      a.classList.toggle("text-zinc-900", on);
      a.classList.toggle("dark:text-white", on);
      a.classList.toggle("text-zinc-600", !on);
      a.classList.toggle("dark:text-zinc-400", !on);
    });
    const link = id ? linkMap.get(id) : null;
    if (!indicator) return;
    if (!link) {
      indicator.style.opacity = "0";
      return;
    }
    const parent = link.parentElement.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    indicator.style.width = rect.width + "px";
    indicator.style.transform = `translateX(${rect.left - parent.left}px)`;
    indicator.style.opacity = "1";
  }

  const navHeight = 72;
  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) setActive(visible[0].target.id);
    },
    {
      rootMargin: `-${navHeight}px 0px -55% 0px`,
      threshold: [0, 0.15, 0.35, 0.6, 1],
    }
  );
  sections.forEach((s) => io.observe(s));

  window.addEventListener("resize", () => {
    if (current) {
      const link = linkMap.get(current);
      if (link && indicator) {
        const parent = link.parentElement.getBoundingClientRect();
        const rect = link.getBoundingClientRect();
        indicator.style.width = rect.width + "px";
        indicator.style.transform = `translateX(${rect.left - parent.left}px)`;
      }
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY < 100) setActive(null);
    },
    { passive: true }
  );
})();

// ===== Architektury: block tabs (Blok I–IV) =====
(function blockTabs() {
  const card = document.getElementById("arch-card");
  if (!card) return;
  const tabs = card.querySelectorAll(".block-tab");

  function setActive(n) {
    card.dataset.activeBlock = String(n);
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.block === String(n)));
  }

  tabs.forEach((tab) => tab.addEventListener("click", () => setActive(tab.dataset.block)));
  // prime initial state based on markup (data-active-block="1")
  setActive(card.dataset.activeBlock || "1");
})();
