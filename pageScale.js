"use strict";
function adjustScale() {
    const desiredWidth = 500;
    const currentWidth = Math.min(screen.width, window.innerWidth);
    if (currentWidth <= desiredWidth) {
        let scale = Math.pow(currentWidth / desiredWidth, 1.1);
        scale = scale < 0.33 ? 0.33 : scale;
        document.body.style.transform = "scale(" + scale + ")";
        document.body.style.transformOrigin = "top left";
        document.body.style.transformOrigin = "center top";
    }
    else {
        document.body.style.transform = "";
        document.body.style.transformOrigin = "left top";
    }
}
window.addEventListener("load", () => {
    adjustScale();
    window.addEventListener("resize", adjustScale);
});
