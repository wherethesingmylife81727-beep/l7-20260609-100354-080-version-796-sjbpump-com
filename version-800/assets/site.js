const navToggle = document.querySelector('[data-nav-toggle]');
const navLinks = document.querySelector('[data-nav-links]');

if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    let active = 0;

    const showSlide = (index) => {
        active = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === active);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('active', dotIndex === active);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    if (slides.length > 1) {
        setInterval(() => showSlide(active + 1), 5200);
    }
}

const filterScope = document.querySelector('[data-filter-scope]');

if (filterScope) {
    const input = filterScope.querySelector('[data-card-filter]');
    const region = filterScope.querySelector('[data-region-filter]');
    const cards = Array.from(document.querySelectorAll('[data-card-list] .movie-card'));

    const applyFilter = () => {
        const keyword = (input?.value || '').trim().toLowerCase();
        const regionValue = region?.value || '';

        cards.forEach((card) => {
            const text = [
                card.dataset.title,
                card.dataset.year,
                card.dataset.region,
                card.dataset.genre
            ].join(' ').toLowerCase();
            const matchText = !keyword || text.includes(keyword);
            const matchRegion = !regionValue || card.dataset.region === regionValue;
            card.classList.toggle('hidden', !(matchText && matchRegion));
        });
    };

    input?.addEventListener('input', applyFilter);
    region?.addEventListener('change', applyFilter);
}

const createResultCard = (movie) => {
    const article = document.createElement('article');
    article.className = 'movie-card';
    article.dataset.title = movie.title;
    article.dataset.year = movie.year;
    article.dataset.region = movie.region;
    article.dataset.genre = movie.genre;

    article.innerHTML = `
        <a class="movie-poster" href="./${movie.file}">
            <img src="${movie.cover}" alt="${movie.title}" loading="lazy">
            <span class="movie-shade"></span>
            <span class="movie-year">${movie.year}</span>
            <span class="play-dot">▶</span>
        </a>
        <div class="movie-card-body">
            <h2><a href="./${movie.file}">${movie.title}</a></h2>
            <p class="movie-meta">${movie.region} · ${movie.type} · ${movie.genre}</p>
            <p class="movie-line">${movie.oneLine}</p>
        </div>
    `;

    return article;
};

function setupSearchPage(movieSearchData) {
    const input = document.querySelector('[data-search-input]');
    const button = document.querySelector('[data-search-button]');
    const results = document.querySelector('[data-search-results]');

    if (!input || !button || !results) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    input.value = initialQuery;

    const render = () => {
        const keyword = input.value.trim().toLowerCase();
        const source = keyword
            ? movieSearchData.filter((movie) => {
                const haystack = [
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.oneLine,
                    ...(movie.tags || [])
                ].join(' ').toLowerCase();
                return haystack.includes(keyword);
            })
            : movieSearchData.slice(0, 36);

        results.innerHTML = '';
        source.slice(0, 120).forEach((movie) => {
            results.appendChild(createResultCard(movie));
        });
    };

    button.addEventListener('click', render);
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            render();
        }
    });

    render();
}

window.setupSearchPage = setupSearchPage;
