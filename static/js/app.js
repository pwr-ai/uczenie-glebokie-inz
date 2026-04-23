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

  const sections = ["wyklady", "laboratoria", "zespol", "informacje"]
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

  // Scroll-position driven: active section = the last one whose top has
  // crossed the detection line (100 px below viewport top, just under the
  // sticky nav). Reliable for tall sections (Architektury is 260 vh).
  const DETECT_Y = 100;
  function onScroll() {
    if (window.scrollY < 60) {
      setActive(null);
      return;
    }
    let active = null;
    for (const s of sections) {
      if (s.getBoundingClientRect().top <= DETECT_Y) active = s.id;
    }
    setActive(active);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
})();

// ===== Wykłady: scroll-advance + tab clicks (mirror of Architektury) =====
(function wykTabs() {
  const stack = document.getElementById("wyk-stack");
  if (!stack) return;
  const tabs = stack.querySelectorAll(".wyk-tab");
  const host = document.querySelector(".wyk-scroll-host");
  const progressBar = document.getElementById("wyk-progress");
  const progressLabel = document.getElementById("wyk-progress-label");
  const MAX = 4;
  let current = 0;

  function setActive(n) {
    n = Math.max(1, Math.min(MAX, parseInt(n, 10) || 1));
    if (n === current) return;
    current = n;
    stack.dataset.activeBlock = String(n);
    tabs.forEach((t) =>
      t.classList.toggle("is-active", t.dataset.wykBlock === String(n))
    );
    if (progressBar) progressBar.style.width = (n / MAX) * 100 + "%";
    if (progressLabel) progressLabel.textContent = String(n);
  }

  function scrollForBlock(n) {
    if (!host) return null;
    const rect = host.getBoundingClientRect();
    const span = host.offsetHeight - window.innerHeight;
    if (span <= 0) return null;
    const frac = (n - 0.5) / MAX;
    return window.scrollY + rect.top + span * frac;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const n = parseInt(tab.dataset.wykBlock, 10);
      const y = scrollForBlock(n);
      if (y != null) window.scrollTo({ top: y });
      setActive(n);
    });
  });

  if (host) {
    function onScroll() {
      const rect = host.getBoundingClientRect();
      const span = host.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const progress = Math.max(0, Math.min(0.9999, -rect.top / span));
      setActive(Math.floor(progress * MAX) + 1);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  } else {
    setActive(stack.dataset.activeBlock || "1");
  }
})();

// ===== Architektury: block tabs + scroll-advance =====
(function blockTabs() {
  const card = document.getElementById("arch-card");
  if (!card) return;
  const tabs = card.querySelectorAll(".block-tab");
  const host = document.querySelector(".arch-scroll-host");
  const progressBar = document.getElementById("arch-progress");
  const progressLabel = document.getElementById("arch-progress-label");
  const MAX = 4;
  let current = 0; // force first paint

  function setActive(n) {
    n = Math.max(1, Math.min(MAX, parseInt(n, 10) || 1));
    if (n === current) return; // no-op if unchanged → prevents animation-restart flicker
    current = n;
    card.dataset.activeBlock = String(n);
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.block === String(n)));
    if (progressBar) progressBar.style.width = (n / MAX) * 100 + "%";
    if (progressLabel) progressLabel.textContent = String(n);
  }

  // Map block number → page scroll position inside the 260vh host (centre of each slot)
  function scrollForBlock(n) {
    if (!host) return null;
    const rect = host.getBoundingClientRect();
    const span = host.offsetHeight - window.innerHeight;
    if (span <= 0) return null;
    const frac = (n - 0.5) / MAX; // centre of slot n
    return window.scrollY + rect.top + span * frac;
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const n = parseInt(tab.dataset.block, 10);
      // Instant scroll — avoids smooth-scroll traversal re-firing the scroll
      // handler and flickering the active tab through intermediate blocks.
      const y = scrollForBlock(n);
      if (y != null) window.scrollTo({ top: y });
      setActive(n);
    });
  });

  if (host) {
    function onScroll() {
      const rect = host.getBoundingClientRect();
      const span = host.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const progress = Math.max(0, Math.min(0.9999, -rect.top / span));
      setActive(Math.floor(progress * MAX) + 1);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  } else {
    setActive(card.dataset.activeBlock || "1");
  }
})();
