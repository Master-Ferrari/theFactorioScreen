const titleText = "theFactorioScreen";
const titleElement = document.getElementById('title');

if (titleElement) {
    titleText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.classList.add('letter');
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });

    let hue = 0;
    setInterval(() => {
        hue = (hue + 1) % 360;
        document.querySelectorAll('.letter').forEach((el, index) => {
            const letter = el as HTMLElement;
            letter.style.color = `hsl(${(hue + index * 30) % 360}, 100%, 50%)`;
        });
    }, 100);
}




const islandWidth = 470;
const resizeMainContent = () => {
    const mainContent = document.getElementById('mainContent');
    const mainContainer = document.getElementById('mainContainer');
    if (mainContent && mainContainer) {
        let islandCount = Math.floor(mainContainer.offsetWidth / islandWidth);
        if (islandCount < 1) { islandCount = 1; }
        else if (islandCount > 4) { islandCount = 4; }
        mainContent.style.width = islandCount * islandWidth + 'px';
    }
}
window.addEventListener('resize', function () {
    resizeMainContent();
});
resizeMainContent();
