(function () {
    "use strict";

    const pages = [
        { file: "index.html", title: "Home" },
        { file: "1.html", title: "Page 1" },
        { file: "2.html", title: "Page 2" },
        { file: "3.html", title: "Page 3" },
        { file: "4.html", title: "Page 4" },
        { file: "5.html", title: "Page 5" }
    ];

    function getCurrentFile() {
        const pathname = decodeURIComponent(window.location.pathname);
        const filename = pathname.substring(pathname.lastIndexOf("/") + 1);

        return filename || "index.html";
    }

    function createElement(tagName, options = {}) {
        const element = document.createElement(tagName);

        if (options.className) {
            element.className = options.className;
        }

        if (options.text !== undefined) {
            element.textContent = options.text;
        }

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([name, value]) => {
                element.setAttribute(name, value);
            });
        }

        return element;
    }

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

    function createDisabledButton(label, icon) {
        const button = createElement("button", {
            className: "nav-btn nav-disabled",
            attributes: {
                type: "button",
                disabled: "",
                "aria-label": `${label} page unavailable`
            }
        });

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

        button.append(iconElement, textElement);

        return button;
    }

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

        if (currentIndex !== -1) {
            const progressSection = createElement("div", {
                className: "nav-progress-section"
            });

            const progressText = createElement("p", {
                className: "nav-progress-text",
                text:
                    `${pages[currentIndex].title} · ` +
                    `${currentIndex + 1} of ${pages.length}`
            });

            const progressTrack = createElement("div", {
                className: "nav-progress-track",
                attributes: {
                    role: "progressbar",
                    "aria-label": "Page progress",
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
            nav.appendChild(progressSection);
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
            controls.appendChild(
                createDisabledButton("Previous", "←")
            );
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
            controls.appendChild(
                createDisabledButton("Next", "→")
            );
        }

        nav.appendChild(controls);

        const customMount = document.getElementById("site-nav");

        if (customMount) {
            customMount.replaceChildren(nav);
        } else {
            document.body.appendChild(nav);
        }
    }

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
        });
    }

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
                    "aria-label":
                        table.getAttribute("aria-label") ||
                        "Scrollable table"
                }
            });

            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        });
    }

    function enhanceExternalLinks() {
        document.querySelectorAll('a[href^="http"]').forEach(link => {
            try {
                const targetUrl = new URL(link.href);

                if (targetUrl.origin !== window.location.origin) {
                    link.target = "_blank";
                    link.rel = "noopener noreferrer";
                }
            } catch {
                // Leave invalid URLs unchanged.
            }
        });
    }

    function prefersReducedMotion() {
        return Boolean(
            window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
        );
    }

    function initialize() {
        createNavigation();
        createBackToTopButton();
        enableKeyboardNavigation();
        makeTablesResponsive();
        enhanceExternalLinks();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize, {
            once: true
        });
    } else {
        initialize();
    }
})();
