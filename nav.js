(function() {
    const pages = ["index.html", "1.html", "2.html", "3.html", "4.html", "5.html"];
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const currentIndex = pages.indexOf(currentPath);

    // Apply dark mode immediately to prevent flash
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    let navHTML = '<div class="nav-container">';
    
    // Previous Button
    if (currentIndex > 0) {
        navHTML += `<a href="${pages[currentIndex - 1]}" class="nav-btn">« Previous</a>`;
    }
    
    // Home Button
    navHTML += `<a href="index.html" class="nav-btn">Home</a>`;
    
    // Toggle Theme Button
    navHTML += `<button class="nav-btn" onclick="toggleTheme()">Dark Mode</button>`;
    
    // Next Button
    if (currentIndex < pages.length - 1) {
        navHTML += `<a href="${pages[currentIndex + 1]}" class="nav-btn">Next »</a>`;
    }
    
    navHTML += '</div>';
    document.write(navHTML);
})();

// Global function for the toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}
