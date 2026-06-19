(function () {
    function setup(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-button');
        var source = video ? video.querySelector('source') : null;
        var stream = source ? source.getAttribute('src') : '';
        var hls = null;
        var ready = false;

        function prepare() {
            if (!video || ready) {
                return;
            }
            ready = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (stream) {
                    video.src = stream;
                }
            } else if (window.Hls && window.Hls.isSupported && window.Hls.isSupported()) {
                while (video.firstChild) {
                    video.removeChild(video.firstChild);
                }
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (stream) {
                video.src = stream;
            }
        }

        function play() {
            if (!video) {
                return;
            }
            prepare();
            box.classList.add('is-playing');
            video.setAttribute('controls', 'controls');
            var playback = video.play();
            if (playback && playback.catch) {
                playback.catch(function () {
                    video.setAttribute('controls', 'controls');
                });
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        box.addEventListener('click', function (event) {
            if (event.target === video || event.target.closest('.player-overlay')) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls && hls.destroy) {
                hls.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('.player-box')).forEach(setup);
})();
