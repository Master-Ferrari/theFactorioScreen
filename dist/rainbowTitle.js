"use strict";
const titleOptions = ["theFactorioScreen", "Приколюха", "Смішняка"];
let titleIndex = 0;
const titleElement = document.getElementById('title');
// const themeSwitch = document.getElementById('themeSwitch') as HTMLInputElement;
function updateTitleText() {
    titleElement.innerHTML = ''; // Очистим предыдущий текст
    const currentText = titleOptions[titleIndex];
    // Отобразим текущий текст по буквам с анимацией
    currentText.split('').forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter;
        span.classList.add('letter');
        span.style.animationDelay = `${index * 0.1}s`;
        titleElement.appendChild(span);
    });
    // Увеличиваем индекс для следующего значения по кругу
    titleIndex = (titleIndex + 1) % titleOptions.length;
}
if (titleElement) {
    updateTitleText();
    titleElement.addEventListener('click', updateTitleText);
    let hue = 0;
    setInterval(() => {
        hue = (hue + 1) % 360;
        document.querySelectorAll('.letter').forEach((el, index) => {
            const letter = el;
            if (themeSwitch.checked) {
                letter.style.color = `hsl(${(hue + index * 30) % 360}, 100%, 50%)`;
            }
            else {
                letter.style.color = `hsl(${(hue + index * 30) % 360}, 100%, 48%)`;
            }
        });
    }, 100);
}
const mainContent = document.getElementById('mainContent');
const mainContainer = document.getElementById('mainContainer');
const islandWidth = 470;
const resizeMainContent = () => {
    if (mainContent && mainContainer) {
        let islandCount = Math.floor(mainContainer.offsetWidth / islandWidth);
        if (islandCount < 1) {
            islandCount = 1;
        }
        else if (islandCount > 4) {
            islandCount = 4;
        }
        mainContent.style.width = islandCount * islandWidth + 'px';
    }
};
window.addEventListener('resize', function () {
    resizeMainContent();
});
resizeMainContent();
//# sourceMappingURL=rainbowTitle.js.map