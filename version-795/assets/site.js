const ready = (callback) => {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
};

const normalize = (value) => String(value || "").toLowerCase().trim();

function setupMobileMenu() {
    const button = document.querySelector("[data-mobile-menu-button]");
    const menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
        return;
    }

    button.addEventListener("click", () => {
        menu.classList.toggle("is-open");
    });
}

function setupHeroSlider() {
    const root = document.querySelector("[data-hero-slider]");
    if (!root) {
        return;
    }

    const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
    const prev = root.querySelector("[data-hero-prev]");
    const next = root.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    const setActive = (nextIndex) => {
        if (!slides.length) {
            return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === index);
        });
    };

    const start = () => {
        window.clearInterval(timer);
        timer = window.setInterval(() => setActive(index + 1), 5000);
    };

    if (prev) {
        prev.addEventListener("click", () => {
            setActive(index - 1);
            start();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            setActive(index + 1);
            start();
        });
    }

    dots.forEach((dot, dotIndex) => {
        dot.addEventListener("click", () => {
            setActive(dotIndex);
            start();
        });
    });

    setActive(0);
    start();
}

function setupFilters() {
    const scopes = Array.from(document.querySelectorAll("[data-filter-scope]")).map((panel) => {
        const nextSection = panel.nextElementSibling;
        const grid = nextSection ? nextSection.querySelector("[data-card-grid]") : document.querySelector("[data-card-grid]");
        return { panel, grid };
    });

    scopes.forEach(({ panel, grid }) => {
        if (!panel || !grid) {
            return;
        }

        const input = panel.querySelector("[data-search-input]");
        const yearFilter = panel.querySelector("[data-year-filter]");
        const regionFilter = panel.querySelector("[data-region-filter]");
        const cards = Array.from(grid.querySelectorAll("[data-movie-card]"));

        const apply = () => {
            const keyword = normalize(input ? input.value : "");
            const selectedYear = yearFilter ? yearFilter.value : "";
            const selectedRegion = normalize(regionFilter ? regionFilter.value : "");

            cards.forEach((card) => {
                const haystack = normalize([
                    card.dataset.title,
                    card.dataset.region,
                    card.dataset.year,
                    card.dataset.tags,
                    card.dataset.type
                ].join(" "));
                const matchKeyword = !keyword || haystack.includes(keyword);
                const matchYear = !selectedYear || card.dataset.year === selectedYear;
                const matchRegion = !selectedRegion || normalize(card.dataset.region).includes(selectedRegion) || haystack.includes(selectedRegion);
                card.classList.toggle("is-hidden", !(matchKeyword && matchYear && matchRegion));
            });
        };

        if (input) {
            input.addEventListener("input", apply);
        }
        if (yearFilter) {
            yearFilter.addEventListener("change", apply);
        }
        if (regionFilter) {
            regionFilter.addEventListener("change", apply);
        }
    });
}

ready(() => {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
});
