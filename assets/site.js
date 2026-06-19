(function () {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.menu-toggle');
    if (header && toggle) {
        toggle.addEventListener('click', function () {
            header.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var search = document.getElementById('page-search');
    var genre = document.getElementById('genre-filter');
    var year = document.getElementById('year-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var empty = document.getElementById('empty-state');

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var keyword = normalize(search && search.value);
        var genreValue = normalize(genre && genre.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
            var data = normalize(card.getAttribute('data-search'));
            var cardGenre = normalize(card.getAttribute('data-genre'));
            var cardYear = normalize(card.getAttribute('data-year'));
            var keywordMatch = !keyword || data.indexOf(keyword) !== -1;
            var genreMatch = !genreValue || cardGenre.indexOf(genreValue) !== -1;
            var yearMatch = !yearValue || cardYear === yearValue;
            var matched = keywordMatch && genreMatch && yearMatch;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    [search, genre, year].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });
})();
