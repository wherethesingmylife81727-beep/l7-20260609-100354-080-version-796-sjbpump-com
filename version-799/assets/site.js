(function () {
    function selectAll(selector, scope) {
        return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
    }

    function escapeText(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        var dots = selectAll('[data-hero-dot]');
        if (slides.length < 2) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function show(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === activeIndex);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === activeIndex);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(activeIndex + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                window.clearInterval(timer);
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        start();
    }

    function setupGlobalSearch() {
        var input = document.getElementById('global-search');
        var results = document.getElementById('global-search-results');
        var data = window.SEARCH_MOVIES || [];
        if (!input || !results || !data.length) {
            return;
        }

        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            results.innerHTML = '';
            if (!query) {
                return;
            }
            var matches = data.filter(function (item) {
                return item.filter.indexOf(query) !== -1;
            }).slice(0, 9);
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + escapeText(item.link) + '">' +
                    '<img src="' + escapeText(item.image) + '" alt="' + escapeText(item.title) + '">' +
                    '<span><strong>' + escapeText(item.title) + '</strong><span>' + escapeText(item.meta) + '</span></span>' +
                    '</a>';
            }).join('');
            if (!matches.length) {
                results.innerHTML = '<div class="search-result-item"><span><strong>暂无匹配影片</strong><span>换一个关键词试试</span></span></div>';
            }
        });
    }

    function yearMatches(filter, yearValue) {
        var year = Number(yearValue) || 0;
        if (filter === 'all') {
            return true;
        }
        if (filter === '2020') {
            return year >= 2020;
        }
        if (filter === '2010') {
            return year >= 2010 && year <= 2019;
        }
        if (filter === '2000') {
            return year >= 2000 && year <= 2009;
        }
        if (filter === 'old') {
            return year > 0 && year < 2000;
        }
        return true;
    }

    function setupCardFilters() {
        var cards = selectAll('[data-movie-card]');
        var searchInput = document.querySelector('[data-card-search]');
        var regionSelect = document.querySelector('[data-filter-region]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var noResults = document.querySelector('[data-no-results]');
        if (!cards.length) {
            return;
        }

        function apply() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
            var region = regionSelect ? regionSelect.value : 'all';
            var type = typeSelect ? typeSelect.value : 'all';
            var year = yearSelect ? yearSelect.value : 'all';
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute('data-filter') || '';
                var cardRegion = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = (!query || text.indexOf(query) !== -1) &&
                    (region === 'all' || cardRegion === region) &&
                    (type === 'all' || cardType === type) &&
                    yearMatches(year, cardYear);
                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle('is-visible', visible === 0);
            }
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupGlobalSearch();
        setupCardFilters();
    });
}());
