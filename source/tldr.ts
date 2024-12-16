document.addEventListener("DOMContentLoaded", () => {
    const tldrHeader = document.getElementById("tldr-title");
    const tldrContent = document.getElementById("tldr-content");

    if (tldrHeader && tldrContent) {
        tldrHeader.addEventListener("click", () => {
            tldrContent.classList.toggle("expanded");
            tldrHeader.textContent = tldrHeader.textContent === "(text)" ? "(hide)" : "(text)";
        });
    }
});
