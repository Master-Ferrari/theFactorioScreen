"use strict";
const themeSwitch = document.getElementById('themeSwitch');
const body = document.body;
// Устанавливаем тему при загрузке
const isDark = (localStorage.getItem('theme') || 'dark') === 'dark';
body.classList.toggle('light-theme', !isDark);
themeSwitch.checked = isDark;
themeSwitch.addEventListener('change', () => {
    const isDark = themeSwitch.checked;
    body.classList.toggle('light-theme', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});
//# sourceMappingURL=themeSwitch.js.map