function initVideoPlayer(streamUrl) {
    var video = document.getElementById("main-player");
    var overlay = document.getElementById("player-overlay");
    var button = document.getElementById("player-play-button");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !overlay || !streamUrl) {
        return;
    }

    function loadStream() {
        if (loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hlsInstance) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                }
            });
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        loadStream();
        video.controls = true;
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                overlay.classList.remove("is-hidden");
            });
        }
    }

    overlay.addEventListener("click", playVideo);
    if (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            playVideo();
        });
    }
    video.addEventListener("click", function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });
}

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileNav() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });
        restart();
    }

    function setupFilter() {
        var input = document.getElementById("movie-search");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var params = new URLSearchParams(location.search);
        var initial = params.get("q") || "";
        if (initial) {
            input.value = initial;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilter() {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var haystack = normalize(card.getAttribute("data-search"));
                card.classList.toggle("is-hidden-card", query && haystack.indexOf(query) === -1);
            });
        }

        input.addEventListener("input", applyFilter);
        applyFilter();
    }

    ready(function () {
        setupMobileNav();
        setupHero();
        setupFilter();
    });
})();
