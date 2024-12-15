import { AlertManager } from "./alertManager.js";
import { CanvasDrawer } from "./canvasDrawer.js";
export const defaultDridData = { x: new Set(), y: new Set(), xMax: 0, yMax: 0, totalWidth: 0, rowLenght: 0 };
export class Tight3to4CanvasManager {
    get gridArray() { return this._gridArray; }
    // private targetWidth = 1;
    // private targetHeight = 1;
    // private xOffset = 0;
    // private yOffset = 0;
    constructor(canvas, mainCanvas) {
        this.intermediateSize = { width: 0, height: 0 };
        this.ElementWidth = 406;
        this.ElementHeight = 150;
        this.mainWidth = 1;
        this.mainHeight = 1;
        this.alertManager = AlertManager.getInstance();
        this.gridAlert = false;
        this.gaps = 0;
        this._gridArray = defaultDridData;
        this.canvas = canvas;
        this.context = canvas.getContext("2d", { willReadFrequently: true });
        this.mainCanvas = mainCanvas;
        this.mainContext = mainCanvas.getContext("2d", { willReadFrequently: true });
        this.ElementInit();
        this.intermediateCanvas = document.createElement("canvas");
        this.intermediateContext = this.intermediateCanvas.getContext("2d", { willReadFrequently: true });
        this.intermediateCanvas.width = this.mainCanvas.width;
        this.intermediateCanvas.height = this.mainCanvas.height;
    }
    resetInterToMain() {
        this.intermediateCanvas.width = this.mainCanvas.width;
        this.intermediateCanvas.height = this.mainCanvas.height;
        this.intermediateContext.clearRect(0, 0, this.intermediateCanvas.width, this.intermediateCanvas.height);
        this.intermediateContext.drawImage(this.mainCanvas, 0, 0);
    }
    ElementInit() {
        this.canvas.style.width = this.ElementWidth + 'px';
        this.canvas.style.height = this.ElementHeight + 'px';
        this.mainWidth = this.mainCanvas.width;
        this.mainHeight = this.mainCanvas.height;
        // const { width: targetW, height: targetH } = this.calcTargetSize(this.mainWidth, this.mainHeight);
        // this.placeInside(this.mainWidth, this.mainHeight);
    }
    placeInside(innerCanvas, innerImageWidth, innerImageHeight) {
        const innerRatio = innerCanvas.width / innerCanvas.height;
        const outerRatio = this.ElementWidth / this.ElementHeight;
        if (outerRatio > innerRatio) {
            this.canvas.height = innerImageHeight;
            this.canvas.width = innerImageHeight * outerRatio;
        }
        else {
            this.canvas.width = innerImageWidth;
            this.canvas.height = innerImageWidth / outerRatio;
        }
        const xOffset = Math.round(this.canvas.width / 2 - this.intermediateCanvas.width / 2);
        const yOffset = Math.round(this.canvas.height / 2 - this.intermediateCanvas.height / 2);
        this.context?.drawImage(innerCanvas, xOffset, yOffset);
    }
    static getInstance(canvas, mainCanvas) {
        if (!Tight3to4CanvasManager.instance) {
            Tight3to4CanvasManager.instance = new Tight3to4CanvasManager(canvas, mainCanvas);
        }
        return Tight3to4CanvasManager.instance;
    }
    static destroyInstance() {
        if (Tight3to4CanvasManager.instance) {
            delete Tight3to4CanvasManager.instance;
        }
    }
    update(frameCount, gridIsEnabled, gridGap, gridOffset, onlyFrame, disableSubstations, firstFrameClip, lastFrameClip) {
        this.gridAlert = false;
        if (!this.context)
            return "";
        let decoderGaps = 0;
        let frameGaps = 0;
        this.resetInterToMain(); // бновить промежуток
        const drawer = new CanvasDrawer(this.intermediateContext); // рисуем
        let oscilatorGap = 0;
        console.log("test34", firstFrameClip, lastFrameClip);
        if (gridIsEnabled) {
            let gap = null;
            for (let i = 0; i < 13; i++) {
                gap = this.isNeedGap(2, gridGap, gridOffset);
                this.addLogicLineToLeft(drawer, 2, gap, "rgb(150, 150, 150)", gridIsEnabled, gridGap, gridOffset); //декодер
                if (onlyFrame) {
                    drawer.clear();
                }
                // if (i < 4 && gap !== null && gap >= 3) {
                //     this.gridAlert = true;
                // }
            }
            decoderGaps = this.intermediateCanvas.width - this.mainCanvas.width - 26;
            oscilatorGap = this.isNeedGap(3, gridGap, gridOffset) ?? 0;
            for (let i = 0; i < frameCount; i++) {
                let colors = {
                    light: "rgb(200, 200, 200)",
                    gark: "rgb(170, 170, 170)"
                };
                if (i < firstFrameClip || i >= lastFrameClip) {
                    colors.gark = "rgba(0, 0, 0, 0)";
                    colors.light = "rgba(0, 0, 0, 0)";
                }
                gap = this.isNeedGap(2, gridGap, gridOffset);
                this.addLogicLineToLeft(drawer, 2, gap, colors.gark, gridIsEnabled, gridGap, gridOffset); // кадры
                gap = this.isNeedGap(1, gridGap, gridOffset);
                this.addLogicLineToLeft(drawer, 1, gap, colors.light, gridIsEnabled, gridGap, gridOffset);
            }
        }
        else {
            this.gridAlert = false;
            drawer.addStripe({ width: 26, direction: "left", color: "rgb(150, 150, 150)" }); //декодер
            if (onlyFrame) {
                drawer.clear();
            }
            for (let i = 0; i < frameCount; i++) {
                let colors = {
                    light: "rgb(200, 200, 200)",
                    gark: "rgb(170, 170, 170)"
                };
                if (i < firstFrameClip || i >= lastFrameClip) {
                    colors.gark = "rgba(0, 0, 0, 0)";
                    colors.light = "rgba(0, 0, 0, 0)";
                }
                drawer.addStripe({ width: 2, direction: "left", color: colors.gark }); // кадры
                drawer.addStripe({ width: 1, direction: "left", color: colors.light });
            }
        }
        if (!onlyFrame) {
            drawer.addStripe({ width: 2, direction: "bottom", color: "rgb(120, 220, 120)", lenght: 4, offsetFrom: "end", offset: this.mainCanvas.width + 26 + decoderGaps + oscilatorGap }); // осцилятор
        }
        this.intermediateSize = { width: this.intermediateCanvas.width, height: this.intermediateCanvas.height };
        this.makeGrid(drawer, gridIsEnabled, disableSubstations, gridGap, { x: gridOffset.x - this.gaps, y: gridOffset.y });
        this.placeInside(this.intermediateCanvas, this.intermediateCanvas.width, this.intermediateCanvas.height); // вкорячиваем куда надо
        this.alertManager.setAlert("wrongXOffset", this.gridAlert);
        return "total size: " + this.intermediateCanvas.width + "*" + this.intermediateCanvas.height;
    }
    addLogicLineToLeft(drawer, width, gap, color, gridIsEnabled, gridGap, gridOffset) {
        // const gap = this.isNeedGap(width, gridGap, gridOffset);
        if (gap !== null) {
            drawer.addStripe({ width: gap, direction: "left", color: "rgba(0, 0, 0, 0)" });
        }
        drawer.addStripe({ width: width, direction: "left", color: color });
    }
    isNeedGap(width, gridGap, gridOffset) {
        let offset = gridOffset.x;
        if (offset < 0) {
            offset = gridGap - Math.abs(offset) % gridGap;
        }
        const canvas = this.intermediateCanvas.width;
        let intra = (canvas + offset) % gridGap;
        let extra = gridGap - intra;
        if (intra == 0) {
            extra = 0;
        } // нюанс расчётов. иначе вместо ноль будет gap.
        if (extra >= 0 && extra < width) {
            let gap = extra % width; // это короче как далеко слева лэп
            gap = gap == 0 ? width : width + extra; // если вот прям лэп
            gap = gap < 2 ? 2 : gap; // отступ должен быть не короче лэпа
            return gap;
        }
        else if (intra < 2) {
            let gap = 2 - intra;
            return gap;
        }
        return null;
    }
    // private checkLeftSideOnGridIntersection(gridGap: number, gridOffset: { x: number, y: number }, width: number): number {
    //     // const checkStripe = this.intermediateCanvas.width + gridGap * 2;
    //     let neededOffset = 0;
    //     const offset = gridOffset.x % gridGap;
    //     for (let wX = 0; wX < width; wX++) {
    //         const rCount = Math.floor((this.intermediateCanvas.width) / gridGap);
    //         console.log("offset - wX - gridGap * rCount", offset - wX - gridGap * rCount);
    //         if (offset - wX - gridGap * rCount == -this.intermediateCanvas.width) {
    //             neededOffset = wX;
    //         }
    //     }
    //     return neededOffset;
    // }
    getSize() {
        return { width: this.intermediateSize.width ?? 0, height: this.intermediateSize.height ?? 0 };
    }
    makeGrid(drawer, gridIsEnabled, disableSubstations, gridGap, gridOffset) {
        if (!gridIsEnabled) {
            this._gridArray = defaultDridData;
            return;
        }
        // const color = disableSubstations ? "rgba(0, 0, 0, 0)" : "rgb(120, 220, 120)"; //60, 200, 20
        this._gridArray = defaultDridData;
        this._gridArray.x = new Set();
        this._gridArray.y = new Set();
        this._gridArray.rowLenght = 0;
        const gridArr = [];
        for (let x = this.intermediateCanvas.width + gridGap * 6 - 2; x >= -gridGap * 6 - 2; x -= gridGap) {
            for (let y = -gridGap * 4; y < this.intermediateCanvas.height + gridGap * 6; y += gridGap) {
                gridArr.push({
                    x: x + gridOffset.x,
                    y: y + gridOffset.y
                });
            }
        }
        let firstY = null;
        gridArr.forEach(point => {
            if (point.x < 0 - gridGap / 2 || // короче для того чтобы всё-всё было залэпено
                point.x > this.intermediateCanvas.width + gridGap / 2 - 2 ||
                point.y < 0 - gridGap / 2 ||
                point.y > this.intermediateCanvas.height + gridGap / 2 - 3) {
                return;
            }
            if (firstY == null) {
                firstY = point.y;
            }
            if (point.y == firstY) {
                this._gridArray.rowLenght++; // считаем короче количество лэп в ряду
            }
            // const leftBorder = 0;
            // const rightBorder = this.intermediateCanvas.width;
            // const topBorder = 0;
            // const bottomBorder = this.intermediateCanvas.height;
            // this._gridArray.x.push(point.x);
            this._gridArray.x.add(point.x);
            this._gridArray.y.add(point.y);
            if (!disableSubstations) {
                drawer.drawSquare(point.x, point.y, 2, 2, "rgb(120, 220, 120)");
            }
            else {
                drawer.clearSquare(point.x, point.y, 2, 2);
            }
            const leftImageBorderDistance = this.intermediateCanvas.width - this.mainCanvas.width - point.x;
            if (leftImageBorderDistance >= 0 && leftImageBorderDistance <= 1) { // один из двух самых левых пикселей, то алерт. алертXOffset сделать свойством класса.
                // drawer.drawSquare(point.x, point.y, 2, 2, "rgb(255, 38, 0)");
                this.gridAlert = true;
            }
        });
        console.log("test32-rowLenght", this._gridArray.rowLenght);
        this._gridArray.xMax = Array.from(this._gridArray.x).pop() ?? 0;
        this._gridArray.yMax = Array.from(this._gridArray.y).pop() ?? 0;
        this._gridArray.totalWidth = this.intermediateCanvas.width;
        // shit generator use case:
        // kakashkaGenerator();
        // drawer.drawSquare(x + gridOffset.x, y + gridOffset.y, 2, 2, "rgb(255, 38, 0)");
        // console.log("test7-x-widrh", -x, this.mainCanvas.width);
        // if (-x == this.mainCanvas.width) { // один из двух самых левых пикселей, то алерт. алертXOffset сделать свойством класса.
        //     this.gridAlert = true;
        // }
    }
}
