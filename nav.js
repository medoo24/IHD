// nav.js
(function() {
    const pages = ["index.html", "1.html", "2.html", "3.html", "4.html", "5.html"];
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const currentIndex = pages.indexOf(currentPath);

    let navHTML = '<div class="nav-container">';
    
    if (currentIndex > 0) {
        navHTML += `<a href="${pages[currentIndex - 1]}">« Previous</a>`;
    }
    navHTML += `<a href="index.html">Home</a>`;
    if (currentIndex < pages.length - 1) {
        navHTML += `<a href="${pages[currentIndex + 1]}">Next »</a>`; 
    }
    
    navHTML += '</div>';
    document.write(navHTML);
})();
