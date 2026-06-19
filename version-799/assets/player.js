(function () {
    window.startMoviePlayer = function (videoId, overlayId, source) {
        var video = document.getElementById(videoId);
        var overlay = document.getElementById(overlayId);
        var hlsInstance = null;
        var attached = false;

        if (!video || !overlay || !source) {
            return;
        }

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function begin() {
            attach();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var request = video.play();
            if (request && typeof request.catch === 'function') {
                request.catch(function () {});
            }
        }

        overlay.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
}());
