(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav-links");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.getElementById("hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupIndexSearch() {
    var input = document.getElementById("global-search");
    var results = document.getElementById("search-results");
    if (!input || !results || !window.SEARCH_MOVIES) {
      return;
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = "";
        return;
      }
      results.innerHTML = items.slice(0, 12).map(function (movie) {
        return "<a class=\"search-result-card\" href=\"./" + movie.file + "\">" +
          "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
          "<span><strong>" + escapeHtml(movie.title) + "</strong>" +
          "<span>" + escapeHtml(movie.region + " · " + movie.year + " · " + movie.genre) + "</span></span>" +
          "</a>";
      }).join("");
    }

    input.addEventListener("input", function () {
      var keyword = normalize(input.value);
      if (!keyword) {
        results.innerHTML = "";
        return;
      }
      var matched = window.SEARCH_MOVIES.filter(function (movie) {
        return normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.year + " " + movie.genre + " " + movie.tags).indexOf(keyword) !== -1;
      });
      render(matched);
    });

    var form = document.querySelector(".home-search-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        input.dispatchEvent(new Event("input"));
      });
    }
  }

  function setupCatalogFilters() {
    var tools = document.querySelector(".catalog-tools");
    if (!tools) {
      return;
    }
    var input = tools.querySelector(".catalog-search");
    var chips = Array.prototype.slice.call(tools.querySelectorAll(".filter-chip"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid .movie-card"));
    var active = "全部";

    function apply() {
      var keyword = normalize(input ? input.value : "");
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-genre") + " " + card.getAttribute("data-year"));
        var byKeyword = !keyword || text.indexOf(keyword) !== -1;
        var byChip = active === "全部" || text.indexOf(normalize(active)) !== -1;
        card.classList.toggle("hidden-by-filter", !(byKeyword && byChip));
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        active = chip.getAttribute("data-filter") || "全部";
        chips.forEach(function (item) {
          item.classList.toggle("active", item === chip);
        });
        apply();
      });
    });

    if (input) {
      input.addEventListener("input", apply);
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  window.initMoviePlayer = function (src) {
    var video = document.getElementById("movie-player");
    var cover = document.getElementById("player-cover");
    var error = document.getElementById("player-error");
    if (!video || !cover || !src) {
      return;
    }

    var hls = null;
    var prepared = false;
    var requested = false;

    function showError() {
      if (error) {
        error.hidden = false;
      }
    }

    function playVideo() {
      video.setAttribute("controls", "controls");
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {});
      }
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requested) {
            playVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        if (requested) {
          playVideo();
        }
      } else {
        showError();
      }
    }

    function start() {
      requested = true;
      cover.classList.add("player-cover-hidden");
      prepare();
      playVideo();
    }

    cover.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupNav();
    setupHero();
    setupIndexSearch();
    setupCatalogFilters();
  });
})();
