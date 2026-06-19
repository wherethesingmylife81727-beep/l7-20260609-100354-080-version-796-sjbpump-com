function setupPlayer(videoId, buttonId, overlayId, sourceUrl) {
    const video = document.getElementById(videoId);
    const button = document.getElementById(buttonId);
    const overlay = document.getElementById(overlayId);

    if (!video || !button || !overlay || !sourceUrl) {
        return;
    }

    let loaded = false;
    let hls = null;

    const loadSource = () => {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
        } else {
            video.src = sourceUrl;
        }
    };

    const start = () => {
        loadSource();
        overlay.classList.add('hide');
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {});
        }
    };

    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        start();
    });

    overlay.addEventListener('click', start);
    overlay.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            start();
        }
    });

    window.addEventListener('pagehide', () => {
        if (hls) {
            hls.destroy();
            hls = null;
        }
    });
}

window.setupPlayer = setupPlayer;
