function adjustScale() {
    const desiredWidth = 500;
    const currentWidth = screen.width;

    console.log(`Current width: ${currentWidth}px`);
    
    if (currentWidth <= desiredWidth) {
        const scale = Math.pow(currentWidth / desiredWidth, 1.1);
        
        document.body.style.transform = "scale(" + scale + ")";
        document.body.style.transformOrigin = "top left";

        document.body.style.transformOrigin = "center top";

    } else {
        document.body.style.transform = "";

        document.body.style.transformOrigin = "left top";
    }
}

window.addEventListener("load", () => {
    adjustScale();
    window.addEventListener("resize", adjustScale);
});
