import { H as Hls } from './hls.js';

export function startPlayer(options) {
    var video = document.getElementById(options.id);
    var overlay = document.getElementById(options.overlayId);
    var message = document.getElementById(options.messageId || 'player-message');
    var source = options.source;
    var attached = false;
    var hls = null;

    if (!video || !source) {
        return;
    }

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add('show');
        }
    }

    function attachSource() {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, function (_event, data) {
                if (data && data.fatal) {
                    showMessage('视频加载失败，请稍后重试');
                }
            });
        } else {
            showMessage('浏览器暂不支持播放');
        }
    }

    function playVideo() {
        attachSource();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('click', function () {
        attachSource();
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
}
