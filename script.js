/* ============================================================
   KamilGT — портфолио разработчика
   Vanilla JavaScript: мобильное меню, фильтры каталога,
   ненавязчивое появление секций, год в подвале.
   Без JavaScript весь контент и ссылки остаются доступными.
   ============================================================ */

(function () {
  "use strict";

  var doc = document.documentElement;
  var reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Класс `js` включает поведение, которое невозможно без скриптов:
  // кнопочное мобильное меню и панель фильтров.
  doc.classList.add("js");

  /* ---------- Мобильное меню ---------- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) {
      return;
    }

    var desktop = typeof window.matchMedia === "function"
      ? window.matchMedia("(min-width: 881px)")
      : null;

    function isOpen() {
      return nav.classList.contains("nav--open");
    }

    function setOpen(open, moveFocus) {
      nav.classList.toggle("nav--open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");

      if (open && moveFocus) {
        var first = nav.querySelector("a");
        if (first) {
          first.focus();
        }
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!isOpen(), false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && isOpen()) {
        setOpen(false, false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!isOpen()) {
        return;
      }
      if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false, false);
      }
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest && event.target.closest("a")) {
        setOpen(false, false);
      }
    });

    if (desktop) {
      var onChange = function () {
        if (desktop.matches) {
          setOpen(false, false);
          toggle.setAttribute("aria-label", "Открыть меню");
        }
      };
      if (desktop.addEventListener) {
        desktop.addEventListener("change", onChange);
      } else if (desktop.addListener) {
        desktop.addListener(onChange);
      }
    }
  }

  /* ---------- Фильтры каталога ---------- */
  function pluralProjects(count) {
    var n = Math.abs(count) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) {
      return "проектов";
    }
    if (n1 > 1 && n1 < 5) {
      return "проекта";
    }
    if (n1 === 1) {
      return "проект";
    }
    return "проектов";
  }

  function initFilters() {
    var group = document.querySelector("[data-filters]");
    var catalog = document.querySelector("[data-catalog]");
    if (!group || !catalog) {
      return;
    }

    var buttons = Array.prototype.slice.call(
      group.querySelectorAll("[data-filter]")
    );
    var cards = Array.prototype.slice.call(
      catalog.querySelectorAll("[data-category]")
    );
    var countEl = document.querySelector("[data-count]");
    var emptyEl = document.querySelector("[data-empty]");
    if (!buttons.length || !cards.length) {
      return;
    }

    function updateCount(shown) {
      if (!countEl) {
        return;
      }
      countEl.textContent = shown + " " + pluralProjects(shown);
    }

    function apply(filter) {
      var shown = 0;

      cards.forEach(function (card) {
        var match =
          filter === "all" || card.getAttribute("data-category") === filter;
        card.hidden = !match;
        if (match) {
          shown += 1;
        }
      });

      buttons.forEach(function (button) {
        var active = button.getAttribute("data-filter") === filter;
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });

      updateCount(shown);

      if (emptyEl) {
        emptyEl.hidden = shown !== 0;
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        apply(button.getAttribute("data-filter") || "all");
      });
    });

    // Управление с клавиатуры: стрелки перемещают фокус между фильтрами.
    group.addEventListener("keydown", function (event) {
      var index = buttons.indexOf(document.activeElement);
      if (index === -1) {
        return;
      }

      var next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        next = buttons[(index + 1) % buttons.length];
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        next = buttons[(index - 1 + buttons.length) % buttons.length];
      } else if (event.key === "Home") {
        next = buttons[0];
      } else if (event.key === "End") {
        next = buttons[buttons.length - 1];
      }

      if (next) {
        event.preventDefault();
        next.focus();
      }
    });

    updateCount(cards.length);
  }

  /* ---------- Появление секций ---------- */
  function initReveal() {
    var elements = Array.prototype.slice.call(
      document.querySelectorAll(".reveal")
    );
    if (!elements.length) {
      return;
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      // Анимация отключена — контент просто виден.
      return;
    }

    doc.classList.add("motion");

    elements.forEach(function (element, index) {
      element.style.transitionDelay = (index % 3) * 70 + "ms";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 }
    );

    elements.forEach(function (element) {
      observer.observe(element);
    });
  }

  /* ---------- Год в подвале ---------- */
  function initYear() {
    var nodes = document.querySelectorAll("[data-year]");
    if (!nodes.length) {
      return;
    }
    var year = String(new Date().getFullYear());
    Array.prototype.forEach.call(nodes, function (node) {
      node.textContent = year;
    });
  }

  function init() {
    initNav();
    initFilters();
    initReveal();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
