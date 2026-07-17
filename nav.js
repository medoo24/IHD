(function () {
    "use strict";

    /*
     * Edit this array whenever pages are added, removed, or reordered.
     *
     * Optional title:
     * { file: "1.html", title: "Introduction" }
     */
    const pages = [
        { file: "index.html", title: "Home" },
        { file: "1.html", title: "Page 1" },
        { file: "2.html", title: "Page 2" },
        { file: "3.html", title: "Page 3" },
        { file: "4.html", title: "Page 4" },
        { file: "5.html", title: "Page 5" }
    ];

    const STORAGE_KEYS = {
        theme: "site-theme",
        scrollPrefix: "site-scroll-position:"
    };

    const root = document.documentElement;

    /**
     * Returns the filename of the current page.
     * Handles URLs containing query parameters, hashes, or encoded filenames.
     */
    function getCurrentFile() {
        const pathname = decodeURIComponent(window.location.pathname);
        const filename = pathname.substring(pathname.lastIndexOf("/") + 1);

        return filename || "index.html";
    }

    /**
     * Reads a saved theme safely.
     * Some privacy modes can block localStorage.
     */
    function getSavedTheme() {
        try {
            const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

            if (savedTheme === "light" || savedTheme === "dark") {
                return savedTheme;
            }
        } catch (error) {
            console.warn("Theme preference could not be read.", error);
        }

        return null;
    }

    /**
     * Uses the saved theme, otherwise follows the operating-system preference.
     */
    function getInitialTheme() {
        const savedTheme = getSavedTheme();

        if (savedTheme) {
            return savedTheme;
        }

        return window.matchMedia?.("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    }

    /**
     * Applies the theme to <html>, allowing it to affect the entire document.
     */
    function applyTheme(theme, savePreference = false) {
        const normalizedTheme = theme === "dark" ? "dark" : "light";

        root.dataset.theme = normalizedTheme;
        root.style.colorScheme = normalizedTheme;

        if (savePreference) {
            try {
                localStorage.setItem(STORAGE_KEYS.theme, normalizedTheme);
            } catch (error) {
                console.warn("Theme preference could not be saved.", error);
            }
        }

        updateThemeButton(normalizedTheme);
    }

    /**
     * Updates accessible text and icons on the theme button.
     */
    function updateThemeButton(theme) {
        const button = document.getElementById("theme-toggle");

        if (!button) {
            return;
        }

        const isDark = theme === "dark";

        button.setAttribute("aria-pressed", String(isDark));
        button.setAttribute(
            "aria-label",
            isDark ? "Switch to light mode" : "Switch to dark mode"
        );
        button.title = isDark
            ? "Switch to light mode"
            : "Switch to dark mode";

        const icon = button.querySelector(".theme-icon");
        const text = button.querySelector(".theme-text");

        if (icon) {
            icon.textContent = isDark ? "☀" : "☾";
            icon.setAttribute("aria-hidden", "true");
        }

        if (text) {
            text.textContent = isDark ? "Light mode" : "Dark mode";
        }
    }

    // Apply the theme immediately to reduce light-theme flashing.
    applyTheme(getInitialTheme());

    /**
     * Creates an element and optionally assigns properties and classes.
     */
    function createElement(tagName, options = {}) {
        const element = document.createElement(tagName);

        if (options.className) {
            element.className = options.className;
        }

        if (options.text) {
            element.textContent = options.text;
        }

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([name, value]) => {
                element.setAttribute(name, value);
            });
        }

        return element;
    }

    /**
     * Creates a navigation link with consistent accessibility attributes.
     */
    function createNavLink({
        href,
        label,
        icon,
        className = "",
        relation = ""
    }) {
        const link = createElement("a", {
            className: `nav-btn ${className}`.trim(),
            attributes: {
                href,
                "aria-label": label
            }
        });

        if (relation) {
            link.rel = relation;
        }

        const iconElement = createElement("span", {
            className: "nav-btn-icon",
            text: icon,
            attributes: {
                "aria-hidden": "true"
            }
        });

        const textElement = createElement("span", {
            className: "nav-btn-text",
            text: label
        });

        link.append(iconElement, textElement);

        return link;
    }

    /**
     * Builds the page navigation.
     */
    function createNavigation() {
        if (document.querySelector("[data-site-navigation]")) {
            return;
        }

        const currentFile = getCurrentFile();
        const currentIndex = pages.findIndex(
            page => page.file.toLowerCase() === currentFile.toLowerCase()
        );

        const nav = createElement("nav", {
            className: "site-navigation",
            attributes: {
                "data-site-navigation": "",
                "aria-label": "Page navigation"
            }
        });

        const progressSection = createElement("div", {
            className: "nav-progress-section"
        });

        if (currentIndex !== -1) {
            const progressText = createElement("p", {
                className: "nav-progress-text",
                text: `${pages[currentIndex].title} · ${currentIndex + 1} of ${pages.length}`
            });

            const progressTrack = createElement("div", {
                className: "nav-progress-track",
                attributes: {
                    role: "progressbar",
                    "aria-label": "Reading progress",
                    "aria-valuemin": "1",
                    "aria-valuemax": String(pages.length),
                    "aria-valuenow": String(currentIndex + 1)
                }
            });

            const progressValue = createElement("span", {
                className: "nav-progress-value"
            });

            progressValue.style.width =
                `${((currentIndex + 1) / pages.length) * 100}%`;

            progressTrack.appendChild(progressValue);
            progressSection.append(progressText, progressTrack);
        }

        const controls = createElement("div", {
            className: "nav-controls"
        });

        const previousPage =
            currentIndex > 0 ? pages[currentIndex - 1] : null;

        const nextPage =
            currentIndex !== -1 && currentIndex < pages.length - 1
                ? pages[currentIndex + 1]
                : null;

        if (previousPage) {
            controls.appendChild(
                createNavLink({
                    href: previousPage.file,
                    label: "Previous",
                    icon: "←",
                    className: "nav-previous",
                    relation: "prev"
                })
            );
        } else {
            controls.appendChild(createDisabledButton("Previous", "←"));
        }

        if (currentFile.toLowerCase() !== "index.html") {
            controls.appendChild(
                createNavLink({
                    href: "index.html",
                    label: "Home",
                    icon: "⌂",
                    className: "nav-home"
                })
            );
        }

        const themeButton = createElement("button", {
            className: "nav-btn nav-theme",
            attributes: {
                id: "theme-toggle",
                type: "button",
                "aria-pressed": "false"
            }
        });

        themeButton.innerHTML = `
            <span class="theme-icon" aria-hidden="true"></span>
            <span class="theme-text"></span>
        `;

        controls.appendChild(themeButton);

        if (nextPage) {
            controls.appendChild(
                createNavLink({
                    href: nextPage.file,
                    label: "Next",
                    icon: "→",
                    className: "nav-next",
                    relation: "next"
                })
            );
        } else {
            controls.appendChild(createDisabledButton("Next", "→"));
        }

        if (progressSection.childElementCount > 0) {
            nav.appendChild(progressSection);
        }

        nav.appendChild(controls);

        /*
         * Add <div id="site-nav"></div> where you want the navigation.
         * Otherwise, it is placed automatically at the bottom of the page.
         */
        const customMount = document.getElementById("site-nav");

        if (customMount) {
            customMount.replaceChildren(nav);
        } else {
            document.body.appendChild(nav);
        }

        themeButton.addEventListener("click", toggleTheme);
        updateThemeButton(root.dataset.theme);
    }

    function createDisabledButton(label, icon) {
        const button = createElement("button", {
            className: "nav-btn nav-disabled",
            attributes: {
                type: "button",
                disabled: "",
                "aria-label": `${label} page unavailable`
            }
        });

        button.innerHTML = `
            <span class="nav-btn-icon" aria-hidden="true">${icon}</span>
            <span class="nav-btn-text">${label}</span>
        `;

        return button;
    }

    function toggleTheme() {
        const nextTheme =
            root.dataset.theme === "dark" ? "light" : "dark";

        applyTheme(nextTheme, true);
    }

    /**
     * Adds a button that appears after scrolling down.
     */
    function createBackToTopButton() {
        if (document.getElementById("back-to-top")) {
            return;
        }

        const button = createElement("button", {
            className: "back-to-top",
            text: "↑",
            attributes: {
                id: "back-to-top",
                type: "button",
                title: "Back to top",
                "aria-label": "Back to top"
            }
        });

        document.body.appendChild(button);

        function updateVisibility() {
            button.classList.toggle(
                "is-visible",
                window.scrollY > 500
            );
        }

        button.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: prefersReducedMotion() ? "auto" : "smooth"
            });
        });

        window.addEventListener("scroll", updateVisibility, {
            passive: true
        });

        updateVisibility();
    }

    /**
     * Keyboard navigation:
     * Alt + Left: previous page
     * Alt + Right: next page
     * Alt + Home: home page
     * Alt + D: toggle theme
     */
    function enableKeyboardNavigation() {
        document.addEventListener("keydown", event => {
            if (!event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }

            const activeElement = document.activeElement;
            const tagName = activeElement?.tagName?.toLowerCase();

            if (
                tagName === "input" ||
                tagName === "textarea" ||
                tagName === "select" ||
                activeElement?.isContentEditable
            ) {
                return;
            }

            const currentFile = getCurrentFile();
            const currentIndex = pages.findIndex(
                page => page.file.toLowerCase() === currentFile.toLowerCase()
            );

            if (event.key === "ArrowLeft" && currentIndex > 0) {
                event.preventDefault();
                window.location.href = pages[currentIndex - 1].file;
            }

            if (
                event.key === "ArrowRight" &&
                currentIndex !== -1 &&
                currentIndex < pages.length - 1
            ) {
                event.preventDefault();
                window.location.href = pages[currentIndex + 1].file;
            }

            if (event.key === "Home") {
                event.preventDefault();
                window.location.href = "index.html";
            }

            if (event.key.toLowerCase() === "d") {
                event.preventDefault();
                toggleTheme();
            }
        });
    }

    /**
     * Keeps track of the reader's position on each page.
     * It does not forcibly restore it; a restore prompt is shown instead.
     */
    function enableReadingPositionMemory() {
        const currentFile = getCurrentFile();
        const storageKey = STORAGE_KEYS.scrollPrefix + currentFile;
        let saveTimer;

        window.addEventListener(
            "scroll",
            () => {
                clearTimeout(saveTimer);

                saveTimer = window.setTimeout(() => {
                    try {
                        sessionStorage.setItem(
                            storageKey,
                            String(Math.round(window.scrollY))
                        );
                    } catch (error) {
                        // Ignore storage restrictions.
                    }
                }, 150);
            },
            { passive: true }
        );

        /*
         * Clear the position when arriving through a normal navigation link.
         * Browser back/forward restoration remains controlled by the browser.
         */
        window.addEventListener("pageshow", event => {
            if (!event.persisted && window.location.hash) {
                const target = document.querySelector(window.location.hash);

                target?.scrollIntoView();
            }
        });
    }

    /**
     * Makes wide tables scrollable without changing existing HTML.
     */
    function makeTablesResponsive() {
        document.querySelectorAll("table").forEach(table => {
            if (table.closest(".table-scroll")) {
                return;
            }

            const wrapper = createElement("div", {
                className: "table-scroll",
                attributes: {
                    tabindex: "0",
                    role: "region",
                    "aria-label": table.getAttribute("aria-label") || "Scrollable table"
                }
            });

            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    /**
     * Improves external links automatically.
     */
    function enhanceExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            try {
                const targetUrl = new URL(link.href);

                if (targetUrl.origin !== window.location.origin) {
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                }
            } catch (error) {
                // Leave malformed links unchanged.
            }
        });
    }

    function prefersReducedMotion() {
        return window.matchMedia?.(
            "(prefers-reduced-motion: reduce)"
        ).matches;
    }

    /**
     * Follows system theme changes only when the user has not selected
     * and saved a specific preference.
     */
    function monitorSystemTheme() {
        if (!window.matchMedia) {
            return;
        }

        const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        mediaQuery.addEventListener?.("change", event => {
            if (!getSavedTheme()) {
                applyTheme(event.matches ? "dark" : "light");
            }
        });
    }

    function initialize() {
        createNavigation();
        createBackToTopButton();
        enableKeyboardNavigation();
        enableReadingPositionMemory();
        makeTablesResponsive();
        enhanceExternalLinks();
        monitorSystemTheme();

        root.classList.add("site-ready");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();
