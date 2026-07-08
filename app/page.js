"use client";

import { useEffect, useState } from "react";

const APP_REPO_URL = "https://github.com/hicksonhaziel/tifo";
const APP_CLONE_URL = "https://github.com/hicksonhaziel/tifo.git";
const RELEASES_URL = "https://github.com/hicksonhaziel/tifo/releases/latest";
const PEARS_DOCS_URL = "https://docs.pears.com/";
const QVAC_DOCS_URL = "https://docs.qvac.tether.io/";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const cleanups = [];

    // ── Nav border on scroll ──────────────────────────
    const nav = document.getElementById("nav");
    const onScroll = () =>
      nav && nav.classList.toggle("scrolled", window.scrollY > 12);
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    cleanups.push(() => document.removeEventListener("scroll", onScroll));

    // ── Hero stadium ring ─────────────────────────────
    (function buildRing() {
      const svg = document.getElementById("ring-segs");
      if (!svg) return;
      svg.innerHTML = "";
      const SEGS = 20;
      const rOuter = 92;
      const rInner = 62;
      const gap = 1.8; // degrees
      const step = 360 / SEGS;

      const segs = [];
      for (let i = 0; i < SEGS; i++) {
        const a0 = ((i * step + gap / 2 - 90) * Math.PI) / 180;
        const a1 = (((i + 1) * step - gap / 2 - 90) * Math.PI) / 180;

        const x0o = Math.cos(a0) * rOuter,
          y0o = Math.sin(a0) * rOuter;
        const x1o = Math.cos(a1) * rOuter,
          y1o = Math.sin(a1) * rOuter;
        const x0i = Math.cos(a0) * rInner,
          y0i = Math.sin(a0) * rInner;
        const x1i = Math.cos(a1) * rInner,
          y1i = Math.sin(a1) * rInner;

        const largeArc = 0;
        const d = `
          M ${x0o} ${y0o}
          A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x1o} ${y1o}
          L ${x1i} ${y1i}
          A ${rInner} ${rInner} 0 ${largeArc} 0 ${x0i} ${y0i}
          Z
        `;
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );
        path.setAttribute("d", d);
        path.setAttribute("class", "seg seg-dim");
        svg.appendChild(path);
        segs.push(path);
      }

      let phase = 0;
      function tick() {
        const N = segs.length;
        for (let i = 0; i < N; i++) {
          const dd = (((i - phase) % N) + N) % N;
          let cls = "seg seg-dim";
          if (dd === 0) cls = "seg seg-hot";
          else if (dd === 1 || dd === N - 1) cls = "seg seg-lit";
          else if (dd === 2 || dd === N - 2) cls = "seg seg-mid";
          else if (dd === 3 || dd === N - 3) cls = "seg seg-mid";
          segs[i].setAttribute("class", cls);
        }
        phase = (phase + 1) % N;
      }
      tick();
      const id = setInterval(tick, 380);
      cleanups.push(() => clearInterval(id));
    })();

    // ── Wave / chant volume bars ──────────────────────
    (function buildWave() {
      const wrap = document.getElementById("wave");
      if (!wrap) return;
      wrap.innerHTML = "";
      const N = 44;
      for (let i = 0; i < N; i++) {
        const bar = document.createElement("i");
        const h = 20 + Math.round(Math.random() * 40);
        bar.style.height = h + "px";
        bar.style.animationDelay = (Math.random() * 1.4).toFixed(2) + "s";
        bar.style.animationDuration = (1.0 + Math.random() * 0.9).toFixed(2) + "s";
        if (i > N * 0.35 && i < N * 0.6 && Math.random() > 0.55) {
          bar.style.background = "var(--flare)";
        }
        wrap.appendChild(bar);
      }
    })();

    // ── P2P mesh SVG (animated) ───────────────────────
    (function buildMesh() {
      const svg = document.getElementById("mesh");
      if (!svg) return;
      svg.innerHTML = "";
      const NS = "http://www.w3.org/2000/svg";

      const rings = [
        { count: 22, rx: 92, ry: 74 },
        { count: 16, rx: 66, ry: 52 },
        { count: 10, rx: 42, ry: 32 },
      ];
      const nodes = [];
      rings.forEach((ring, ri) => {
        for (let i = 0; i < ring.count; i++) {
          const a = (i / ring.count) * Math.PI * 2 + ri * 0.15;
          nodes.push({
            x: Math.cos(a) * ring.rx,
            y: Math.sin(a) * ring.ry,
            ring: ri,
          });
        }
      });

      const edges = new Set();
      function addEdge(i, j) {
        const k = i < j ? `${i}-${j}` : `${j}-${i}`;
        edges.add(k);
      }
      for (let ri = 0; ri < rings.length; ri++) {
        const ringNodes = nodes
          .map((n, idx) => (n.ring === ri ? idx : -1))
          .filter((i) => i >= 0);
        for (let k = 0; k < ringNodes.length; k++) {
          addEdge(ringNodes[k], ringNodes[(k + 1) % ringNodes.length]);
        }
      }
      function nearest(idx, targetRing) {
        const n = nodes[idx];
        let best = -1,
          bestD = Infinity;
        nodes.forEach((m, j) => {
          if (m.ring !== targetRing) return;
          const d = (m.x - n.x) ** 2 + (m.y - n.y) ** 2;
          if (d < bestD) {
            bestD = d;
            best = j;
          }
        });
        return best;
      }
      nodes.forEach((n, i) => {
        if (n.ring === 0 && i % 2 === 0) addEdge(i, nearest(i, 1));
        if (n.ring === 1 && i % 2 === 0) addEdge(i, nearest(i, 2));
      });

      edges.forEach((k) => {
        const [a, b] = k.split("-").map(Number);
        const line = document.createElementNS(NS, "line");
        line.setAttribute("x1", nodes[a].x);
        line.setAttribute("y1", nodes[a].y);
        line.setAttribute("x2", nodes[b].x);
        line.setAttribute("y2", nodes[b].y);
        line.setAttribute("stroke", "#3d5e51");
        line.setAttribute("stroke-width", "0.6");
        line.setAttribute("opacity", "0.55");
        svg.appendChild(line);
      });

      const dots = [];
      nodes.forEach((n) => {
        const c = document.createElementNS(NS, "circle");
        c.setAttribute("cx", n.x);
        c.setAttribute("cy", n.y);
        c.setAttribute("r", 2.6);
        c.setAttribute("fill", "#6a9987");
        svg.appendChild(c);
        dots.push(c);
      });

      const timeouts = [];
      function pulse() {
        const i = Math.floor(Math.random() * dots.length);
        const c = dots[i];
        c.setAttribute("fill", "#f2ede4");
        c.setAttribute("r", 3.6);

        const rip = document.createElementNS(NS, "circle");
        rip.setAttribute("cx", c.getAttribute("cx"));
        rip.setAttribute("cy", c.getAttribute("cy"));
        rip.setAttribute("r", 3);
        rip.setAttribute("fill", "none");
        rip.setAttribute("stroke", "#6a9987");
        rip.setAttribute("stroke-width", "0.8");
        rip.setAttribute("opacity", "0.9");
        svg.appendChild(rip);

        const start = performance.now();
        function anim(t) {
          const p = Math.min(1, (t - start) / 1400);
          rip.setAttribute("r", 3 + p * 22);
          rip.setAttribute("opacity", (0.9 * (1 - p)).toFixed(3));
          if (p < 1) requestAnimationFrame(anim);
          else rip.remove();
        }
        requestAnimationFrame(anim);

        const to = setTimeout(() => {
          c.setAttribute("fill", "#6a9987");
          c.setAttribute("r", 2.6);
        }, 600);
        timeouts.push(to);
      }
      const id = setInterval(pulse, 900);
      const t1 = setTimeout(pulse, 200);
      const t2 = setTimeout(pulse, 500);
      cleanups.push(() => {
        clearInterval(id);
        clearTimeout(t1);
        clearTimeout(t2);
        timeouts.forEach(clearTimeout);
      });
    })();

    // ── Fade-in on scroll ─────────────────────────────
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "-40px 0px", threshold: 0.05 }
    );
    document
      .querySelectorAll(
        "section .section-title, section .section-lede, .feat, .built-card, .dl-card, .problem-cell, .echo-panel, .dev-block, .solution-img"
      )
      .forEach((el) => {
        el.classList.add("fade-in");
        io.observe(el);
      });
    cleanups.push(() => io.disconnect());

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* ─── NAV ─── */}
      <nav className="nav" id="nav">
        <div className="wrap nav-inner">
          <a href="#top" className="brand" aria-label="TIFO home">
            <img className="brand-logo" src="/assets/tifo-logo-trim.png" alt="TIFO" />
          </a>
          <div className="nav-links">
            <a href="#problem">The problem</a>
            <a href="#echo">Echo</a>
            <a href="#features">Features</a>
            <a href="#p2p">Peer-to-peer</a>
            <a href="#download">Download</a>
          </div>
          <a href="#download" className="nav-cta">
            Download →
          </a>
          <button
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
        <div className={"nav-mobile" + (menuOpen ? " open" : "")}>
          <a href="#problem" onClick={() => setMenuOpen(false)}>
            The problem
          </a>
          <a href="#echo" onClick={() => setMenuOpen(false)}>
            Echo
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            Features
          </a>
          <a href="#p2p" onClick={() => setMenuOpen(false)}>
            Peer-to-peer
          </a>
          <a
            href="#download"
            className="mobile-cta"
            onClick={() => setMenuOpen(false)}
          >
            Download →
          </a>
        </div>
      </nav>

      <span id="top"></span>

      {/* ─── HERO ─── */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <h1>
              Build the <span className="sage">terrace.</span>
              <br />
              Preserve the <span className="thin">echo.</span>
            </h1>

            <p className="hero-sub">
              A peer-to-peer living terrace where football fans collectively
              build and replay the atmosphere of the match — synchronized
              chants, flares, and reactions, with zero servers, zero accounts,
              and no Big Tech in between.
            </p>

            <div className="cta-row">
              <a href="#download" className="btn btn-primary">
                Download TIFO
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4v12m0 0l-5-5m5 5l5-5M4 20h16" />
                </svg>
              </a>
              <a href="#echo" className="btn btn-ghost">
                See the Echo
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </a>
            </div>

            <div className="hero-meta">
              <span>
                <span className="tick">◆</span> Zero servers
              </span>
              <span>
                <span className="tick">◆</span> Zero accounts
              </span>
              <span>
                <span className="tick">◆</span> On-device AI
              </span>
              <span>
                <span className="tick">◆</span> Open source · MIT
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <svg className="ring-svg" viewBox="-100 -100 200 200" id="ring">
              <g id="ring-segs"></g>
              <g transform="translate(0, 4)">
                <path
                  d="M 0 -20
                     c -6 6 -8 12 -6 18
                     c 2 6 -2 10 -4 14
                     c -2 4 4 6 4 12
                     Z
                     M 0 -20
                     c 6 6 8 12 6 18
                     c -2 6 2 10 4 14
                     c 2 4 -4 6 -4 12
                     Z"
                  fill="#6a9987"
                  opacity="0.85"
                >
                  <animate
                    attributeName="opacity"
                    values="0.6;0.95;0.6"
                    dur="4.5s"
                    repeatCount="indefinite"
                  />
                </path>
                <circle cx="-14" cy="20" r="7" fill="#f2ede4" />
                <circle cx="0" cy="18" r="8" fill="#f2ede4" />
                <circle cx="14" cy="20" r="7" fill="#f2ede4" />
                <rect x="-22" y="24" width="44" height="14" rx="3" fill="#f2ede4" />
              </g>
            </svg>
          </div>
        </div>
      </header>

      {/* ─── PROBLEM ─── */}
      <section id="problem" className="problem">
        <div className="wrap">
          <div className="section-eyebrow">The Problem</div>
          <h2 className="section-title">
            Matchday atmosphere shouldn&apos;t live on someone else&apos;s
            server.
          </h2>
          <p className="section-lede">
            Football is a collective ritual — chants, flares, tears, the roar.
            Yet the way fans share it now is broken.
          </p>

          <div className="problem-grid">
            <div className="problem-cell">
              <div className="problem-num">01 / Trapped</div>
              <div className="problem-title">Trapped inside platforms.</div>
              <p>
                Matchday atmosphere is siloed in group chats, feeds, and cloud
                servers — moderated by strangers, sorted by algorithms.
              </p>
            </div>
            <div className="problem-cell">
              <div className="problem-num">02 / Fragile</div>
              <div className="problem-title">
                Stadium Wi-Fi fails. Data costs money.
              </div>
              <p>
                When the network drops — and it always drops at the goal — the
                reaction vanishes. Fans scattered across the world can&apos;t
                feel the same moment together.
              </p>
            </div>
            <div className="problem-cell">
              <div className="problem-num">03 / Forgotten</div>
              <div className="problem-title">
                Match memories disappear into the feed.
              </div>
              <p>
                The goal, the chant, the tears — flattened into scroll and gone
                by morning. The atmosphere never gets replayed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section id="solution" className="solution">
        <div className="wrap solution-grid">
          <div>
            <div className="section-eyebrow">What TIFO is</div>
            <h2 className="section-title">
              The atmosphere, given back to the fans.
            </h2>
            <p className="section-lede">
              TIFO is a living terrace. Supporters join match rooms, react
              together, record chants, trigger flares, share clips, and replay
              the key moments — connected directly, peer to peer. No middleman.
              No moderator. Just the crowd.
            </p>

            <div className="cta-row" style={{ marginTop: "40px" }}>
              <a href="#echo" className="btn btn-ghost">
                How the Echo works
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </a>
            </div>
          </div>

          <div className="solution-img">
            <img
              src="/assets/ultras-banner.png"
              alt="Illustration of silhouetted football ultras holding up a tifo banner with soft smoke rising, in the muted sage-green and bone-white palette of the TIFO brand."
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* ─── ECHO ─── */}
      <section id="echo" className="echo">
        <div className="wrap">
          <div className="echo-head">
            <div>
              <div className="section-eyebrow">The Echo System</div>
              <h2 className="section-title">
                Not just match chat.{" "}
                <span style={{ color: "var(--sage)" }}>Match memory.</span>
              </h2>
            </div>
            <div className="echo-pull">
              Every fan&apos;s reaction — a chant, a flare, a burst of emoji, a
              highlight clip — is written into a shared, append-only{" "}
              <strong>P2P timeline</strong>. At half-time, full-time, or when a
              friend joins late, the room hits <em>Replay Echo</em> and the peak
              moment plays back in sync.
            </div>
          </div>

          <div
            className="echo-panel"
            aria-label="Example Echo timeline of a goal moment"
          >
            <div className="echo-visual">
              <div>
                <div className="echo-status">
                  <span className="dot"></span> Echo · Live
                </div>
                <div className="echo-clock" style={{ marginTop: "28px" }}>
                  67<span style={{ color: "var(--sage)" }}>:</span>19
                  <span className="sub">— goal echo triggered —</span>
                </div>
              </div>

              <div>
                <div className="wave" id="wave"></div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "14px",
                    fontFamily: "var(--mono)",
                    fontSize: "11px",
                    color: "var(--muted)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  <span>12 fans chanting</span>
                  <span>MAR&nbsp;2 — 1&nbsp;ESP</span>
                </div>
              </div>
            </div>

            <div className="echo-timeline">
              <h3>Timeline — the goal moment</h3>

              <div className="tl-row hot">
                <div className="tl-time">67:19</div>
                <div className="tl-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <div className="tl-body">
                  Goal Echo triggered
                  <em>Room hooks the moment · 24 fans in room</em>
                </div>
              </div>

              <div className="tl-row">
                <div className="tl-time">67:21</div>
                <div className="tl-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2v14" />
                    <path d="M9 5l3-3 3 3" />
                    <path d="M5 20h14" />
                  </svg>
                </div>
                <div className="tl-body">
                  5 fans send audio chants
                  <em>&quot;¡A por ellos!&quot; · &quot;Dima Maghrib&quot; · &quot;Olé olé olé&quot;</em>
                </div>
              </div>

              <div className="tl-row">
                <div className="tl-time">67:25</div>
                <div className="tl-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 3s5 5 5 10a5 5 0 01-10 0c0-5 5-10 5-10z" />
                  </svg>
                </div>
                <div className="tl-body">
                  Visual flares triggered
                  <em>3 red · 2 green · smoke plume across the room</em>
                </div>
              </div>

              <div className="tl-row">
                <div className="tl-time">67:40</div>
                <div className="tl-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="5" width="14" height="14" rx="2" />
                    <path d="M17 10l4-2v8l-4-2" />
                  </svg>
                </div>
                <div className="tl-body">
                  Celebration clip shared
                  <em>18 sec · 620 KB · peer-to-peer</em>
                </div>
              </div>

              <div className="tl-row hot">
                <div className="tl-time">90:00</div>
                <div className="tl-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M4 12a8 8 0 108-8" />
                    <path d="M4 4v6h6" />
                  </svg>
                </div>
                <div className="tl-body">
                  Full-time Echo
                  <em>
                    Replay the peak moments — synced across every device in the
                    room
                  </em>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="features">
        <div className="wrap">
          <div className="section-eyebrow">Core Features</div>
          <h2 className="section-title">
            Everything a terrace needs. Nothing a server does.
          </h2>
          <p className="section-lede">
            Six primitives, wired to work together. Room, reaction, chant,
            translation, sync, replay.
          </p>

          <div className="features-grid">
            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
                </svg>
              </div>
              <p>
                Join a room by fixture — Morocco vs. Spain, kickoff 21:00 — or
                paste an invite code. Your device connects straight to the
                others in the room. No signup, no login, no gate.
              </p>
              <h3>P2P Match Rooms</h3>
            </div>

            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 3s5 5 5 10a5 5 0 01-10 0c0-5 5-10 5-10z" />
                  <path d="M12 12v6" />
                </svg>
              </div>
              <p>
                Goal flares, chant flares, flag waves, drum bursts, fireworks.
                Big, physical, on-screen — fired by one fan, felt by the whole
                room in real time.
              </p>
              <h3>Live Reactions &amp; Flares</h3>
            </div>

            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="9" y="3" width="6" height="12" rx="3" />
                  <path d="M5 11a7 7 0 0014 0M12 18v3M8 21h8" />
                </svg>
              </div>
              <p>
                Hold to record. A short chant — 5, 10 seconds — becomes part of
                the room&apos;s memory. Every fan&apos;s voice, layered into the
                Echo.
              </p>
              <h3>Audio Chants</h3>
            </div>

            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M5 8h11M9 4h4" />
                  <path d="M12 14l4-6 4 6M14 12h4" />
                  <path d="M4 20l4-8 4 8M6 17h4" />
                </svg>
              </div>
              <p>
                Understand the chants of fans in any language. QVAC runs the AI
                on your device — no cloud, no data leaves your phone.
              </p>
              <h3>On-Device Translation (QVAC)</h3>
            </div>

            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 12a8 8 0 018-8 8 8 0 016 2.6M20 4v5h-5" />
                  <path d="M20 12a8 8 0 01-8 8 8 8 0 01-6-2.6M4 20v-5h5" />
                </svg>
              </div>
              <p>
                Stadium Wi-Fi drops. It always does. Your reactions save locally
                and merge into the room the second you reconnect — no lost
                moments.
              </p>
              <h3>Offline-First Sync</h3>
            </div>

            <div className="feat">
              <div className="feat-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M10 8l6 4-6 4z" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p>
                At half-time, full-time, or when a friend joins late — relive
                the best moments of the match, in sync, exactly as the room
                lived them.
              </p>
              <h3>Replay Echo</h3>
            </div>
          </div>
        </div>
      </section>

      {/* ─── P2P ─── */}
      <section id="p2p" className="p2p">
        <div className="wrap p2p-grid">
          <div className="p2p-mesh" aria-hidden="true">
            <img
              className="p2p-mesh-img"
              src="/assets/p2p-mesh.png"
              alt="Peer-to-peer mesh of fans connected directly, with no central server."
            />
          </div>

          <div>
            <div className="section-eyebrow">Why peer-to-peer</div>
            <h2 className="section-title">One shared memory. No central copy.</h2>

            <div className="p2p-pull">
              Every fan writes their own chant, flare, and celebration into their
              own <strong>local log</strong>. TIFO merges every fan&apos;s log —
              live, with no server — into <strong>one shared match memory</strong>{" "}
              the whole room can replay.
            </div>

            <p className="section-lede" style={{ fontSize: "16px" }}>
              No central copy of the room exists anywhere. If the internet cuts,
              the room lives on between whoever is still connected. If everyone
              leaves, the memory stays on each fan&apos;s device — hers to keep,
              hers to share, hers to replay.
            </p>

            <div className="callouts">
              <span className="callout">No servers</span>
              <span className="callout">No accounts</span>
              <span className="callout">No cloud</span>
              <span className="callout">No Big Tech</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BUILT ON ─── */}
      <section className="built">
        <div className="wrap">
          <div className="section-eyebrow">Built On</div>
          <h2 className="section-title">
            Open protocols. Local-first. Private by design.
          </h2>
          <p className="section-lede">
            TIFO is built on the same peer-to-peer primitives trusted by
            developers who refuse to depend on Big Tech. Every layer is
            inspectable, replaceable, and yours.
          </p>

          <div className="built-grid">
            <a
              href={PEARS_DOCS_URL}
              className="built-card"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Pear documentation"
            >
              <div className="tag">P2P Networking</div>
              <div className="built-logo pear">
                <img src="/assets/pears-logo.svg" alt="Pears" />
              </div>
              <h4>Pears Stack</h4>
              <p>
                Direct fan-to-fan connections without a central relay. Rooms
                form, merge, and dissolve without a server ever seeing them.
              </p>
              <ul>
                <li>Hyperswarm</li>
                <li>Hypercore</li>
                <li>Autobase</li>
              </ul>
            </a>

            <a
              href={QVAC_DOCS_URL}
              className="built-card"
              target="_blank"
              rel="noreferrer"
              aria-label="Open QVAC documentation"
            >
              <div className="tag">On-Device AI</div>
              <div className="built-logo qvac">
                <img src="/assets/qvac-logo.svg" alt="QVAC" />
              </div>
              <h4>QVAC</h4>
              <p>
                Chat and chant translation running locally on your device. Model
                weights and inference stay off the cloud — your voice never
                leaves.
              </p>
              <ul>
                <li>Local inference</li>
                <li>Multilingual</li>
                <li>Chant-aware</li>
              </ul>
            </a>

            <div className="built-card">
              <div className="tag">Design Principles</div>
              <h4>Local-First</h4>
              <p>
                Actions save to disk before they sync. Offline works. Reconnect
                merges. Your match memory belongs to you, and works even when the
                network doesn&apos;t.
              </p>
              <ul>
                <li>Offline capable</li>
                <li>Append-only log</li>
                <li>End-to-end</li>
              </ul>
            </div>
          </div>

          <div className="built-stripe">
            <span>
              <span className="tick">◆</span> No servers
            </span>
            <span>
              <span className="tick">◆</span> No accounts
            </span>
            <span>
              <span className="tick">◆</span> No cloud
            </span>
            <span>
              <span className="tick">◆</span> No Big Tech
            </span>
            <span>
              <span className="tick">◆</span> Open Source · MIT
            </span>
          </div>
        </div>
      </section>

      {/* ─── DOWNLOAD ─── */}
      <section id="download" className="download">
        <div className="wrap">
          <div className="dl-head">
            <div className="section-eyebrow">Download</div>
            <h2 className="section-title">Join a terrace. Start an Echo.</h2>
            <p>
              TIFO 1.0.0 is ready for the 2026 World Cup. Pick your platform,
              invite your section, and see you at kickoff.
            </p>
          </div>

          <div className="dl-platforms">
            <a
              href={RELEASES_URL}
              className="dl-card"
              aria-label="Download TIFO for Linux"
              target="_blank"
              rel="noreferrer"
            >
              <div className="os-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <ellipse cx="12" cy="15" rx="5" ry="6" />
                  <path d="M9 9c0-2 1-4 3-4s3 2 3 4" />
                  <circle cx="10.5" cy="10.5" r="0.6" fill="currentColor" />
                  <circle cx="13.5" cy="10.5" r="0.6" fill="currentColor" />
                  <path d="M11 13l1 0.6 1 -0.6" />
                </svg>
              </div>
              <h4>Linux</h4>
              <div className="os-meta">AppImage · 84 MB · x86_64</div>
              <span className="os-arrow">
                tifo-1.0.0.AppImage
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </span>
            </a>

            <a
              href={RELEASES_URL}
              className="dl-card"
              aria-label="Download TIFO for macOS"
              target="_blank"
              rel="noreferrer"
            >
              <div className="os-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M15 3c-1 1-2 3-1 5 2 0 3-1 3-3M8 21c-2 0-4-3-4-7 0-4 2-6 4-6 1 0 2 1 3 1s2-1 3-1c2 0 4 2 4 6 0 4-2 7-4 7-1 0-2-1-3-1s-2 1-3 1z" />
                </svg>
              </div>
              <h4>macOS</h4>
              <div className="os-meta">DMG · 92 MB · Apple Silicon &amp; Intel</div>
              <span className="os-arrow">
                tifo-1.0.0.dmg
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </span>
            </a>

            <a
              href={RELEASES_URL}
              className="dl-card"
              aria-label="Download TIFO for Windows"
              target="_blank"
              rel="noreferrer"
            >
              <div className="os-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="4" width="8" height="8" />
                  <rect x="13" y="4" width="8" height="8" />
                  <rect x="3" y="14" width="8" height="8" />
                  <rect x="13" y="14" width="8" height="8" />
                </svg>
              </div>
              <h4>Windows</h4>
              <div className="os-meta">MSIX · 88 MB · Windows 10+</div>
              <span className="os-arrow">
                tifo-1.0.0.msix
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
                </svg>
              </span>
            </a>
          </div>

          <div className="dev-block">
            <div>
              <h3>Building from source?</h3>
              <p>
                TIFO is fully open source. Clone the repo, run two commands, and
                you&apos;re on the terrace.
              </p>
              <div className="dev-badges">
                <span className="badge">v 1.0.0</span>
                <span className="badge mit">MIT License</span>
                <a
                  href={APP_REPO_URL}
                  className="badge gh"
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width="12"
                    height="12"
                    style={{ marginRight: "6px", verticalAlign: "-1px" }}
                  >
                    <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.8 10.9.6.1.8-.2.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.5-2.5-.3-5.2-1.3-5.2-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.1 0 4.5-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.5-1.5 7.8-5.8 7.8-10.9C23.5 5.7 18.3.5 12 .5z" />
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            <div className="terminal" aria-label="Developer setup — two commands">
              <div className="term-head">
                <span className="lite" style={{ background: "#d97757" }}></span>
                <span className="lite" style={{ background: "#6a9987" }}></span>
                <span className="lite"></span>
                <span className="label">~/tifo — zsh</span>
              </div>
              <div className="term-body">
                <div>
                  <span className="comment"># clone the repo</span>
                </div>
                <div>
                  <span className="prompt">$</span> git clone {APP_CLONE_URL}
                </div>
                <div>
                  <span className="prompt">$</span> cd tifo
                </div>
                <br />
                <div>
                  <span className="comment"># install &amp; run</span>
                </div>
                <div>
                  <span className="prompt">$</span> npm install
                </div>
                <div>
                  <span className="prompt">$</span> npm start
                  <span className="cursor"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer>
        <div className="wrap">
          <div className="foot-tag">The crowd lives on.</div>
          <img className="foot-logo" src="/assets/tifo-logo-trim.png" alt="TIFO" />

          <div className="foot-row">
            <div>
              © 2026 · TIFO — The Living Terrace ·{" "}
              <span className="foot-builton">
                Built on
                <img className="pearl" src="/assets/pears-logo.svg" alt="Pears" />
                <span className="plus">+</span>
                <img className="qvacl" src="/assets/qvac-logo.svg" alt="QVAC" />
              </span>
            </div>
            <div className="foot-links">
              <a href={APP_REPO_URL} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a
                href={`${APP_REPO_URL}/blob/main/package.json`}
                target="_blank"
                rel="noreferrer"
              >
                MIT License
              </a>
              <a href="#top">Back to top ↑</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
