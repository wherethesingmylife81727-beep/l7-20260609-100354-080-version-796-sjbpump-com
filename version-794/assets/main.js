(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-main-nav]');

    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(index + 1);
            }, 5000);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
    var empty = document.querySelector('[data-empty-state]');

    function matchCard(card) {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';
        var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();

        if (keyword && haystack.indexOf(keyword) === -1) {
            return false;
        }

        if (year && card.getAttribute('data-year') !== year) {
            return false;
        }

        if (type && card.getAttribute('data-type') !== type) {
            return false;
        }

        return true;
    }

    function applyFilter() {
        var shown = 0;

        cards.forEach(function (card) {
            var visible = matchCard(card);
            card.style.display = visible ? '' : 'none';
            if (visible) {
                shown += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', shown === 0);
        }
    }

    if (filterInput || yearSelect || typeSelect) {
        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }

        if (typeSelect) {
            typeSelect.addEventListener('change', applyFilter);
        }

        applyFilter();
    }
})();
