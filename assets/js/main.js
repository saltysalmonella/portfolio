/* Sam Yang — portfolio interactions
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ---- current year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- nav buttons: scroll to section (don't rely on CSS smooth-scroll) ---- */
  var HEADER_OFFSET = 88;

  // Force an immediate jump. NOTE: CSS `scroll-behavior: smooth` applies to
  // scrollTo()/scrollTop too, so we must temporarily neutralise it — otherwise
  // the "instant" fallback animates as well, and fails for the same reason.
  function jumpTo(top) {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    root.style.scrollBehavior = prev;
  }

  function scrollToSection(target) {
    var top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    if (top < 0) top = 0;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var startY = window.pageYOffset;

    if (reduce) { jumpTo(top); return; }

    try {
      window.scrollTo({ top: top, behavior: "smooth" });
    } catch (e) {
      jumpTo(top);
      return;
    }

    // If the smooth animation never got going (paused animation frames,
    // background tab, cancelled scroll), force the jump so the button
    // always works.
    window.setTimeout(function () {
      if (Math.abs(window.pageYOffset - startY) < 2 && Math.abs(top - startY) > 2) {
        jumpTo(top);
      }
    }, 450);
  }

  document.querySelectorAll('.nav__links a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      scrollToSection(target);
      if (history.replaceState) history.replaceState(null, "", id);
    });
  });

  /* ---- nav: add border once scrolled ---- */
  var nav = document.getElementById("nav");
  var onScroll = function () {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- active nav link via section observer ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav__links a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navLinks.forEach(function (a) {
            a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- lightbox for CAD shots ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lightboxImg");
  var lbClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lb) return;
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(function () { lb.hidden = true; lbImg.src = ""; }, 250);
  }

  document.querySelectorAll(".shot").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var img = btn.querySelector("img");
      openLightbox(btn.getAttribute("data-full"), img ? img.alt : "");
    });
  });
  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lb) lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb && !lb.hidden) closeLightbox();
  });

  /* ---- be a good citizen: pause hero video when offscreen ---- */
  var video = document.querySelector(".feature__video");
  if (video && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var p = video.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.2 });
    vio.observe(video);
  }
})();
