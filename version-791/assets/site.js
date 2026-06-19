(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var active = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === active);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === active);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });
      if (prev) {
        prev.addEventListener("click", function () {
          show(active - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(active + 1);
          restart();
        });
      }
      show(0);
      restart();
    });

    document.querySelectorAll("[data-year-tabs]").forEach(function (wrap) {
      var tabs = Array.prototype.slice.call(wrap.querySelectorAll(".year-tab"));
      var panels = Array.prototype.slice.call(document.querySelectorAll("[data-year-panel]"));
      tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          var year = tab.getAttribute("data-year-tab");
          tabs.forEach(function (item) {
            item.classList.toggle("is-active", item === tab);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle("is-active", panel.getAttribute("data-year-panel") === year);
          });
        });
      });
    });

    document.querySelectorAll("[data-filter-area]").forEach(function (area) {
      var input = area.querySelector(".filter-input");
      var chips = Array.prototype.slice.call(area.querySelectorAll(".filter-chip"));
      var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
      var empty = area.querySelector(".empty-state");
      var queryParams = new URLSearchParams(window.location.search);
      var initialQuery = queryParams.get("q");

      if (input && initialQuery) {
        input.value = initialQuery;
      }

      function activeFilter() {
        var active = chips.find(function (chip) {
          return chip.classList.contains("is-active");
        });
        return active ? active.getAttribute("data-filter") : "全部";
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var filter = activeFilter();
        var visible = 0;
        cards.forEach(function (card) {
          var hay = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
          var cardType = card.getAttribute("data-type") || "";
          var genre = card.getAttribute("data-genre") || "";
          var matchesText = !query || hay.indexOf(query) !== -1;
          var matchesFilter = filter === "全部" || cardType.indexOf(filter) !== -1 || genre.indexOf(filter) !== -1;
          var show = matchesText && matchesFilter;
          card.classList.toggle("is-hidden-card", !show);
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          applyFilter();
        });
      });
      if (input) {
        input.addEventListener("input", applyFilter);
      }
      applyFilter();
    });

    document.querySelectorAll(".video-stage").forEach(function (stage) {
      var video = stage.querySelector("video");
      var cover = stage.querySelector(".player-cover");
      if (!video) {
        return;
      }
      var streamUrl = video.getAttribute("data-video") || "";
      var started = false;

      function connect() {
        if (started || !streamUrl) {
          return;
        }
        started = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function playMovie() {
        connect();
        video.controls = true;
        if (cover) {
          cover.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", playMovie);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          playMovie();
        }
      });
    });
  });
})();
