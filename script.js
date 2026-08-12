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
    // Populate after SONAR settles. Leave empty to keep this section hidden.
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
     Join form — progressive enhancement.
     Without JS: a normal POST to the form's action, with a hidden
     _next field so the backend (Formspree/Netlify-style) redirects
     to confirm.html. With JS: intercept, submit via fetch, and swap
     in the confirmation copy in place so the person never leaves
     the page.
  --------------------------------------------------------------- */
  var form = document.getElementById("join-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      var action = form.getAttribute("action");
      if (!action || action === "#") {
        // Backend not wired up yet — let it no-op rather than
        // pretend to succeed. See README.md.
        return;
      }
      event.preventDefault();

      var submitBtn = form.querySelector(".btn-submit");
      if (submitBtn) submitBtn.textContent = "Sending…";

      fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            showConfirmation();
          } else {
            if (submitBtn) submitBtn.textContent = "Join the founding cohort";
            form.submit(); // fall back to a normal navigation
          }
        })
        .catch(function () {
          form.submit();
        });
    });
  }

  function showConfirmation() {
    var panel = document.getElementById("join-panel");
    if (!panel) return;
    var discordHref = document.querySelector('[data-role="discord-link"]');
    var href = discordHref ? discordHref.getAttribute("href") : "#";

    panel.innerHTML =
      '<div class="confirm-panel" style="display:block">' +
      "<p>You&rsquo;re in. First session is <strong>Wednesday, August 26</strong>.</p>" +
      "<p>Join the Discord now &mdash; that&rsquo;s where everything happens between sessions.</p>" +
      '<a class="btn btn-primary" href="' + href + '">Open Discord</a>' +
      "</div>";
  }
})();
