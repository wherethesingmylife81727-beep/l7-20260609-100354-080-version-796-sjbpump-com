(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");

  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const show = (nextIndex) => {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    };

    const start = () => {
      timer = window.setInterval(() => show(index + 1), 5000);
    };

    const restart = () => {
      window.clearInterval(timer);
      start();
    };

    if (prev) {
      prev.addEventListener("click", () => {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", () => {
        show(index + 1);
        restart();
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    show(0);
    start();
  }

  const panels = document.querySelectorAll("[data-filter-panel]");

  panels.forEach((panel) => {
    const page = panel.closest("main") || document;
    const list = page.querySelector("[data-filter-list]");
    const input = panel.querySelector("[data-filter-input]");
    const region = panel.querySelector("[data-region-filter]");
    const type = panel.querySelector("[data-type-filter]");
    const year = panel.querySelector("[data-year-filter]");

    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll(".movie-card"));

    const apply = () => {
      const keyword = (input ? input.value : "").trim().toLowerCase();
      const regionValue = region ? region.value : "";
      const typeValue = type ? type.value : "";
      const yearValue = year ? year.value : "";

      cards.forEach((card) => {
        const text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();

        const regionOk = !regionValue || card.getAttribute("data-region") === regionValue;
        const typeOk = !typeValue || card.getAttribute("data-type") === typeValue;
        const yearOk = !yearValue || card.getAttribute("data-year") === yearValue;
        const keywordOk = !keyword || text.includes(keyword);

        card.classList.toggle("is-filter-hidden", !(regionOk && typeOk && yearOk && keywordOk));
      });
    };

    [input, region, type, year].forEach((control) => {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q && input) {
      input.value = q;
      apply();
    }
  });

  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const overlay = player.querySelector(".player-overlay");
    let prepared = false;
    let hls = null;

    const prepare = () => {
      if (!video || prepared) {
        return;
      }

      const source = video.getAttribute("data-video-url") || "";

      if (!source) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }

      prepared = true;
    };

    const play = () => {
      prepare();

      if (!video) {
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      const promise = video.play();

      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", () => {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", () => {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", () => {
        if (overlay && video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  });
})();
