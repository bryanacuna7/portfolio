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

  function bootAll() {
    init();
    initDrawer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAll);
  } else {
    bootAll();
  }
})();
