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
