(function() {
    const pages = ["index.html", "1.html", "2.html", "3.html", "4.html", "5.html"];
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const currentIndex = pages.indexOf(currentPath);

    // Apply saved theme immediately
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute("data-theme", savedTheme);

    let navHTML = '<div class="nav-container">';
    if (currentIndex > 0) navHTML += `<a href="${pages[currentIndex - 1]}" class="nav-btn">« Previous</a>`;
    navHTML += `<a href="index.html" class="nav-btn">Home</a>`;
    navHTML += `<button id="theme-toggle" class="nav-btn">Toggle Dark Mode</button>`;
    if (currentIndex < pages.length - 1) navHTML += `<a href="${pages[currentIndex + 1]}" class="nav-btn">Next »</a>`;
    navHTML += '</div>';
    
    document.write(navHTML);

    // Add event listener after document is ready
    setTimeout(() => {
        document.getElementById('theme-toggle').addEventListener('click', () => {
            const current = document.body.getAttribute("data-theme");
            const next = current === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", next);
            localStorage.setItem('theme', next);
        });
    }, 0);
})();
