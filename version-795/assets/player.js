(function () {
    const showMessage = (element, text) => {
        if (!element) {
            return;
        }
        element.textContent = text;
        element.classList.add("is-visible");
    };

    window.setupPlayer = function (source, poster) {
        const root = document.querySelector("[data-player]");
        if (!root) {
            return;
        }

        const video = root.querySelector("video");
        const cover = root.querySelector("[data-player-cover]");
        const message = root.querySelector("[data-player-message]");
        let hls = null;

        if (!video) {
            return;
        }

        if (poster) {
            video.setAttribute("poster", poster);
        }

        const attachSource = () => {
            if (hls) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, (eventName, data) => {
                    if (data && data.fatal) {
                        showMessage(message, "视频加载失败，请稍后再试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else {
                showMessage(message, "视频暂时无法播放");
            }
        };

        const startPlay = async () => {
            attachSource();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            try {
                await video.play();
            } catch (error) {
                showMessage(message, "点击视频区域即可继续播放");
            }
        };

        if (cover) {
            cover.addEventListener("click", startPlay);
        }

        video.addEventListener("click", () => {
            if (video.paused) {
                startPlay();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", () => {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
    };
})();
