(function () {
    function ready(callback) {
        if (document.readyState !== "loading") {
            callback();
        } else {
            document.addEventListener("DOMContentLoaded", callback);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector(".nav-toggle");
        var wrap = document.querySelector(".nav-wrap");
        if (!toggle || !wrap) {
            return;
        }
        toggle.addEventListener("click", function () {
            wrap.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var track = hero.querySelector(".hero-track");
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function render() {
            track.style.transform = "translateX(-" + index * 100 + "%)";
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function go(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            render();
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                go(index + 1);
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
                go(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                go(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                go(dotIndex);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        render();
        start();
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var button = shell.querySelector(".player-start");
            var status = shell.querySelector(".player-status");
            var src = shell.getAttribute("data-src");
            var started = false;
            var hls = null;

            function setStatus(text) {
                if (status) {
                    status.textContent = text;
                }
            }

            function loadSource() {
                if (!video || !src || started) {
                    return;
                }
                started = true;
                setStatus("正在加载播放源...");
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已就绪");
                    });
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                                setStatus("网络异常，正在重试...");
                                hls.startLoad();
                            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                                setStatus("媒体异常，正在恢复...");
                                hls.recoverMediaError();
                            } else {
                                setStatus("播放失败，请稍后再试");
                                hls.destroy();
                            }
                        }
                    });
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    video.addEventListener("loadedmetadata", function () {
                        setStatus("播放源已就绪");
                    }, { once: true });
                } else {
                    video.src = src;
                    setStatus("当前浏览器需要 HLS 支持");
                }
            }

            function play() {
                loadSource();
                if (!video) {
                    return;
                }
                var promise = video.play();
                if (promise && typeof promise.then === "function") {
                    promise.then(function () {
                        shell.classList.add("playing");
                    }).catch(function () {
                        setStatus("点击播放按钮开始观看");
                    });
                } else {
                    shell.classList.add("playing");
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener("play", function () {
                    shell.classList.add("playing");
                });
                video.addEventListener("pause", function () {
                    shell.classList.remove("playing");
                });
            }
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function setupSearchPage() {
        var root = document.getElementById("search-results");
        if (!root || !window.SITE_MOVIES) {
            return;
        }
        var form = document.getElementById("page-search-form");
        var input = document.getElementById("page-search-input");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function normalize(text) {
            return String(text || "").toLowerCase();
        }

        function card(movie) {
            return [
                '<article class="movie-card">',
                '<a class="movie-cover" href="' + movie.url + '">',
                '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
                '<span class="badge">' + movie.category + '</span>',
                '<span class="year-badge">' + movie.year + '</span>',
                '<span class="card-play">▶</span>',
                '</a>',
                '<div class="movie-card-body">',
                '<h3><a href="' + movie.url + '">' + movie.title + '</a></h3>',
                '<p class="movie-line">' + movie.description + '</p>',
                '<div class="meta-row"><span class="rating">★ ' + movie.rating + '</span><span>' + movie.region + '</span></div>',
                '</div>',
                '</article>'
            ].join("");
        }

        function render(value) {
            var q = normalize(value).trim();
            var source = window.SITE_MOVIES;
            var matches = q ? source.filter(function (movie) {
                return normalize(movie.title + " " + movie.year + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.tags + " " + movie.description).indexOf(q) !== -1;
            }) : source.slice(0, 40);
            root.innerHTML = matches.slice(0, 120).map(card).join("");
            if (!root.innerHTML) {
                root.innerHTML = '<div class="detail-panel"><h2>没有找到相关影片</h2><p>可以尝试搜索片名、地区、年份或类型。</p></div>';
            }
        }

        if (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render(input ? input.value : "");
                var url = new URL(window.location.href);
                url.searchParams.set("q", input ? input.value : "");
                window.history.replaceState({}, "", url.toString());
            });
        }
        render(query);
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupPlayers();
        setupSearchPage();
    });
}());
