// ===== Scroll reveal =====
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// ===== Lucide icons =====
if (window.lucide) window.lucide.createIcons();

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

  const sections = ["wyklady", "architektury", "laboratoria", "zespol", "informacje"]
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
      a.classList.toggle("text-white", on);
      a.classList.toggle("text-zinc-400", !on);
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

  // Watch sections: pick the one whose top is closest to (but past) the nav
  const navHeight = 72; // approx sticky header height
  const io = new IntersectionObserver(
    (entries) => {
      // Find the entry most visible near the top
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: `-${navHeight}px 0px -55% 0px`,
      threshold: [0, 0.15, 0.35, 0.6, 1],
    }
  );
  sections.forEach((s) => io.observe(s));

  // Recompute indicator on resize
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

  // Clear highlight when scrolled back to the hero
  window.addEventListener("scroll", () => {
    if (window.scrollY < 100) setActive(null);
  }, { passive: true });
})();

// ===== Parallax on hero card =====
const art = document.querySelector(".animate-float");
if (art && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    art.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// ===== Training-loop simulation =====
(function trainLoop() {
  const ep = document.getElementById("t-epoch");
  if (!ep) return;
  const lossEl = document.getElementById("t-loss");
  const accEl = document.getElementById("t-acc");
  const lrEl = document.getElementById("t-lr");
  const bestEl = document.getElementById("t-best");
  const phaseEl = document.getElementById("t-phase");
  const progEl = document.getElementById("t-progress");
  const line = document.getElementById("t-chart-line");
  const area = document.getElementById("t-chart-area");
  const net = document.getElementById("net-svg");
  const phaseDot = document.getElementById("net-phase-dot");

  const MAX_EPOCH = 100;
  const HIST = 40;
  const W = 200, H = 40;
  const history = [];
  let epoch = 1;
  let best = Infinity;
  let phaseIdx = 0;
  const phases = [
    { name: "FORWARD", color: "text-emerald-400", dot: "#34d399" },
    { name: "BACKWARD", color: "text-amber-400", dot: "#fbbf24" },
    { name: "STEP", color: "text-violet-400", dot: "#a78bfa" },
  ];

  // Architecture carousel — manual tabs + auto-cycle every N epochs
  const netStack = document.getElementById("net-stack");
  const archTabs = document.querySelectorAll(".arch-tab");
  const ARCHS = ["mlp", "cnn", "rnn"];
  let archIdx = 0;
  let lastManualSwitch = 0;
  const ARCH_SWITCH_EVERY = 6; // epochs
  const MANUAL_OVERRIDE_EPOCHS = 10; // pause auto-cycle after manual click

  function setArch(next, manual) {
    if (!netStack) return;
    archIdx = ARCHS.indexOf(next);
    if (archIdx < 0) archIdx = 0;
    netStack.dataset.arch = next;
    archTabs.forEach((t) => t.classList.toggle("is-active", t.dataset.archTab === next));
    if (manual) lastManualSwitch = epoch;
  }

  archTabs.forEach((tab) => {
    tab.addEventListener("click", () => setArch(tab.dataset.archTab, true));
  });
  // prime initial active state
  setArch(ARCHS[0], false);

  // Realistic-looking loss curve: exponential decay with plateaus and noise
  function computeLoss(e) {
    const base = 1.5 * Math.exp(-e / 22) + 0.04;
    const noise = (Math.random() - 0.5) * 0.08 * (1 + 3 * Math.exp(-e / 15));
    const plateau = e > 60 ? Math.sin(e * 0.5) * 0.015 : 0;
    return Math.max(0.03, base + noise + plateau);
  }

  function computeAcc(loss) {
    const a = Math.max(0, 1 - loss * 0.58);
    return Math.min(0.994, a + (Math.random() - 0.5) * 0.01);
  }

  function fmtLR(e) {
    // cosine-ish schedule just for flavor
    const r = 3e-4 * (0.5 + 0.5 * Math.cos((e / MAX_EPOCH) * Math.PI));
    return r.toExponential(1).replace("e-", "e-");
  }

  function renderChart() {
    if (history.length < 2) return;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const span = Math.max(0.05, max - min);
    const pts = history.map((v, i) => {
      const x = (i / (HIST - 1)) * W;
      const y = H - ((v - min) / span) * (H - 4) - 2;
      return [x, y];
    });
    line.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    const areaD =
      "M " + pts.map((p) => p.join(",")).join(" L ") +
      ` L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`;
    area.setAttribute("d", areaD);
  }

  function pulseNetwork(phase) {
    if (!net) return;
    net.dataset.phase = phase;
  }

  let tickCount = 0;
  function tick() {
    // Rotate phases every tick (~3 phases per epoch)
    const phase = phases[phaseIdx % phases.length];
    phaseEl.textContent = phase.name;
    phaseEl.className = "font-mono " + phase.color;
    if (phaseDot) phaseDot.setAttribute("fill", phase.dot);
    pulseNetwork(phase.name.toLowerCase());
    phaseIdx++;

    // Advance epoch once every 3 ticks
    if (tickCount % 3 === 0) {
      const loss = computeLoss(epoch);
      const acc = computeAcc(loss);
      history.push(loss);
      if (history.length > HIST) history.shift();
      if (loss < best) best = loss;

      ep.textContent = epoch;
      lossEl.textContent = loss.toFixed(4);
      accEl.textContent = (acc * 100).toFixed(1) + "%";
      lrEl.textContent = fmtLR(epoch);
      bestEl.textContent = "best " + best.toFixed(4);
      progEl.style.width = (epoch / MAX_EPOCH) * 100 + "%";
      renderChart();

      epoch++;
      if (epoch > MAX_EPOCH) {
        // restart with a tiny "reset flash"
        setTimeout(() => {
          epoch = 1;
          best = Infinity;
          history.length = 0;
          progEl.style.width = "0%";
        }, 800);
      }

      // auto-cycle architecture every N epochs (unless user recently clicked a tab)
      if (
        netStack &&
        epoch > 1 &&
        (epoch - 1) % ARCH_SWITCH_EVERY === 0 &&
        epoch - lastManualSwitch > MANUAL_OVERRIDE_EPOCHS
      ) {
        setArch(ARCHS[(archIdx + 1) % ARCHS.length], false);
      }
    }

    tickCount++;
  }

  // Prime a few epochs so chart isn't empty on first render
  for (let i = 0; i < 8; i++) {
    const l = computeLoss(i + 1);
    history.push(l);
    if (l < best) best = l;
  }
  renderChart();
  ep.textContent = history.length;
  lossEl.textContent = history[history.length - 1].toFixed(4);
  bestEl.textContent = "best " + best.toFixed(4);

  setInterval(tick, 550);
})();
