// Theme toggle — persists user override in localStorage,
// updates aria-pressed + aria-label + theme-color meta on change.

(function () {
  "use strict";

  var DARK_COLOR = "#0a0a0a";
  var LIGHT_COLOR = "#fafafa";

  function getThemeColorMeta() {
    return document.querySelector('meta[name="theme-color"]');
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var meta = getThemeColorMeta();
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? DARK_COLOR : LIGHT_COLOR);
    }

    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    var nextLabel =
      "Switch to " + (theme === "dark" ? "light" : "dark") + " theme";
    toggle.setAttribute("aria-label", nextLabel);
    // aria-pressed reflects whether the *non-default* theme is active.
    toggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    toggle.setAttribute("title", nextLabel);
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem("theme");
    } catch (e) {
      return null;
    }
  }

  function storeTheme(theme) {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      /* ignore quota / private-mode errors */
    }
  }

  function init() {
    var stored = readStoredTheme();
    var current =
      stored ||
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    applyTheme(current);

    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var nextTheme =
        document.documentElement.getAttribute("data-theme") === "dark"
          ? "light"
          : "dark";
      storeTheme(nextTheme);
      applyTheme(nextTheme);
    });

    // React to OS-level changes only when user has no explicit override.
    var mq = window.matchMedia("(prefers-color-scheme: light)");
    var handler = function (e) {
      if (readStoredTheme()) return;
      applyTheme(e.matches ? "light" : "dark");
    };
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else if (mq.addListener) {
      mq.addListener(handler);
    }
  }

  function initDrawer() {
    var drawer = document.querySelector("[data-nav-drawer]");
    var openBtn = document.querySelector("[data-nav-toggle]");
    if (!drawer || !openBtn) return;

    var lastFocus = null;

    function openDrawer() {
      lastFocus = document.activeElement;
      drawer.setAttribute("data-open", "true");
      drawer.setAttribute("aria-hidden", "false");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.setAttribute("data-drawer-open", "true");
      var firstLink = drawer.querySelector(".nav-drawer__list a");
      if (firstLink) firstLink.focus();
    }

    function closeDrawer() {
      drawer.removeAttribute("data-open");
      drawer.setAttribute("aria-hidden", "true");
      openBtn.setAttribute("aria-expanded", "false");
      document.body.removeAttribute("data-drawer-open");
      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus();
      }
    }

    openBtn.addEventListener("click", openDrawer);
    drawer.querySelectorAll("[data-nav-close]").forEach(function (el) {
      el.addEventListener("click", closeDrawer);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.getAttribute("data-open") === "true") {
        closeDrawer();
      }
    });
  }

  // --- Scroll-reveal: lift + fade sections into view ---
  function initReveal() {
    var nodes = document.querySelectorAll("[data-reveal]");
    if (!nodes.length || !("IntersectionObserver" in window)) {
      nodes.forEach(function (n) {
        n.setAttribute("data-revealed", "true");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-revealed", "true");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    nodes.forEach(function (n) {
      io.observe(n);
    });
  }

  // --- Stat counters: count up from 0 to target on first visibility ---
  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-counter"), 10);
      if (isNaN(target)) return;
      if (prefersReduced) {
        el.firstChild.textContent = String(target);
        return;
      }
      var duration = 1100;
      var start = null;
      function tick(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        el.firstChild.textContent = Math.round(target * eased).toString();
        if (t < 1) requestAnimationFrame(tick);
        else el.firstChild.textContent = String(target);
      }
      requestAnimationFrame(tick);
    }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) {
              animate(e.target);
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.5 },
      );
      counters.forEach(function (c) {
        io.observe(c);
      });
    } else {
      counters.forEach(animate);
    }
  }

  // --- Magnetic buttons: nudge transform on pointermove ---
  function initMagnetic() {
    var prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    var els = document.querySelectorAll(".magnetic");
    var STRENGTH = 0.22; // 0..1 — how much pointer offset translates to movement
    var MAX = 10; // px cap

    function clamp(v) {
      return Math.max(-MAX, Math.min(MAX, v));
    }

    els.forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        var rect = el.getBoundingClientRect();
        var dx = (e.clientX - (rect.left + rect.width / 2)) * STRENGTH;
        var dy = (e.clientY - (rect.top + rect.height / 2)) * STRENGTH;
        el.style.setProperty("--mx", clamp(dx).toFixed(2));
        el.style.setProperty("--my", clamp(dy).toFixed(2));
      });
      el.addEventListener("pointerleave", function () {
        el.style.setProperty("--mx", "0");
        el.style.setProperty("--my", "0");
      });
    });
  }

  // --- Custom cursor follower for project cards (desktop only) ---
  function initCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches)
      return;
    var prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    var cards = document.querySelectorAll(".card");
    if (!cards.length) return;

    var follower = document.createElement("div");
    follower.className = "cursor-follower";
    follower.textContent = "View →";
    document.body.appendChild(follower);

    function move(e) {
      follower.style.setProperty("--cursor-x", e.clientX + "px");
      follower.style.setProperty("--cursor-y", e.clientY + "px");
    }

    cards.forEach(function (card) {
      card.addEventListener("pointerenter", function () {
        follower.setAttribute("data-visible", "true");
        document.addEventListener("pointermove", move);
      });
      card.addEventListener("pointerleave", function () {
        follower.removeAttribute("data-visible");
        document.removeEventListener("pointermove", move);
      });
    });
  }

  function bootAll() {
    init();
    initDrawer();
    initReveal();
    initCounters();
    initMagnetic();
    initCursor();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAll);
  } else {
    bootAll();
  }
})();
