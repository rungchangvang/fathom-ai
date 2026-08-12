(function () {
  "use strict";

  // Mark that JS is available. CSS uses this to arm the fade-and-rise
  // motion — without it, everything is visible by default (see style.css).
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     Scroll-in reveal — the entire motion budget (fade + 12px rise).
     --------------------------------------------------------------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------------------------------------------------------------
     Depth gutter — brighten the current section's label. The one
     permitted flourish beyond the base reveal (spec 2.7).
     --------------------------------------------------------------- */
  if ("IntersectionObserver" in window) {
    var marks = document.querySelectorAll(".depth-section");
    var depthObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var mark = entry.target.querySelector(".depth-mark");
          if (!mark) return;
          mark.classList.toggle("is-active", entry.isIntersecting);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    marks.forEach(function (el) {
      depthObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     PATHWAYS — data-driven scaffold, intentionally empty until SONAR
     settles (spec Section 0 & 4). Populate this array and the section
     renders itself: heading, depth mark, and a card grid that lays out
     correctly at 3, 5, or 8 entries. No HTML edits required.

     Shape of each entry, matching spec 4.2 / 4.3:

     {
       code: "02",
       name: "Health & Bio",
       description: "Train models on medical imaging and genomic data.",
       bullets: ["chest X-ray classifier", "protein structure basics", "public health forecasting"],
       startHere: "no experience"
     }
  --------------------------------------------------------------- */
  var PATHWAYS = [
    // Empty again — pulled back per spec Section 0/4/8 ([VOLATILE], gated
    // on SONAR settling). The full 7-pathway set from this session is kept
    // below, commented out, so it can be dropped back in with one edit
    // once SONAR actually concludes — no need to redo this from scratch.
    //
    // { code: "00", name: "Foundations", description: "Python, data, first models. No experience assumed.", bullets: ["first script to first model", "data cleaning and plotting", "how a training loop actually works"], startHere: "no experience" },
    // { code: "01", name: "Competitions", description: "USACO, USA National AI Olympiad.", bullets: ["USACO problem sets", "USA National AI Olympiad prep", "timed practice rounds"], startHere: "existing CS or math background" },
    // { code: "02", name: "Health & Bio", description: "Medical imaging classification, genomics and protein datasets.", bullets: ["chest X-ray classifier", "protein structure basics", "public health forecasting"], startHere: "no experience" },
    // { code: "03", name: "Markets & Decision", description: "Forecasting, quantitative modeling, algorithmic decision-making.", bullets: ["price and demand forecasting", "a simple trading or scheduling model", "decision trees on real data"], startHere: "some code" },
    // { code: "04", name: "Perception & Robotics", description: "Computer vision, control systems.", bullets: ["an object-detection model", "a basic control loop", "sensor data on a real or simulated robot"], startHere: "some code" },
    // { code: "05", name: "Language & Media", description: "NLP, generative models, creative applications.", bullets: ["a text classifier", "a small generative project", "prompt design and evaluation"], startHere: "no experience" },
    // { code: "06", name: "Systems & Safety", description: "Evaluation, red-teaming, interpretability, policy.", bullets: ["testing a model for failure modes", "writing an eval", "a short policy or safety writeup"], startHere: "strong CS or math" },
  ];

  function renderPathways(pathways) {
    if (!pathways || pathways.length === 0) return;

    var mount = document.getElementById("pathways-mount");
    if (!mount) return;

    var section = document.createElement("section");
    section.className = "section depth-section";
    section.id = "pathways";
    section.setAttribute("data-depth", "25 fm");

    var mark = document.createElement("div");
    mark.className = "depth-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.innerHTML = '<span class="depth-tick"></span><span class="depth-label">25 fm</span>';
    section.appendChild(mark);

    var h2 = document.createElement("h2");
    h2.className = "section-title";
    h2.textContent = "Pathways";
    section.appendChild(h2);

    var grid = document.createElement("div");
    grid.className = "pathway-grid";

    pathways.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "pathway-card reveal";

      var code = document.createElement("p");
      code.className = "pathway-code";
      code.textContent = "Pathway " + p.code;
      card.appendChild(code);

      var name = document.createElement("h3");
      name.className = "pathway-name";
      name.textContent = p.name;
      card.appendChild(name);

      var desc = document.createElement("p");
      desc.className = "pathway-desc";
      desc.textContent = p.description;
      card.appendChild(desc);

      if (p.bullets && p.bullets.length) {
        var ul = document.createElement("ul");
        ul.className = "pathway-bullets";
        p.bullets.forEach(function (b) {
          var li = document.createElement("li");
          li.textContent = b;
          ul.appendChild(li);
        });
        card.appendChild(ul);
      }

      if (p.startHere) {
        var start = document.createElement("p");
        start.className = "pathway-start";
        start.textContent = "Start here with: " + p.startHere;
        card.appendChild(start);
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
    mount.replaceWith(section);

    if ("IntersectionObserver" in window && !reduceMotion) {
      section.querySelectorAll(".reveal").forEach(function (el) {
        // new nodes need their own observer pass
        var obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        obs.observe(el);
      });
    } else {
      section.querySelectorAll(".reveal").forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  renderPathways(PATHWAYS);

  /* ---------------------------------------------------------------
     Join form — submits into a hidden same-page iframe (see the
     target="fathom-submit-frame" attribute in index.html), so the
     browser never navigates away — that guarantee comes from plain
     HTML and holds even if this script fails to run at all.

     With JS: we still want the branded "You're in" confirmation rather
     than nothing visibly happening. The iframe fires a "load" event
     once Google's response finishes loading inside it — that's our
     signal to swap in the confirmation panel.
  --------------------------------------------------------------- */
  var form = document.getElementById("join-form");
  var frame = document.getElementById("fathom-submit-frame");
  var formWasSubmitted = false;

  if (form && frame) {
    form.addEventListener("submit", function () {
      formWasSubmitted = true;
      var submitBtn = form.querySelector(".btn-submit");
      if (submitBtn) submitBtn.textContent = "Sending…";
      // No preventDefault — let the browser submit normally into the iframe.
    });

    frame.addEventListener("load", function () {
      // Every iframe fires an initial "load" for its blank starting
      // document too — only react once an actual submission happened.
      if (formWasSubmitted) {
        formWasSubmitted = false;
        showConfirmation();
      }
    });
  }

  function showConfirmation() {
    var panel = document.getElementById("join-panel");
    if (!panel) return;

    panel.innerHTML =
      '<div class="confirm-panel" style="display:block">' +
      "<p>You&rsquo;re in. First session is <strong>Wednesday, August 26</strong>.</p>" +
      "<p>Join the Discord now &mdash; that&rsquo;s where everything happens between sessions.</p>" +
      '<a class="btn btn-primary" href="https://discord.gg/pHgJ7Yzr9">Open Discord</a>' +
      "</div>";
  }
})();
