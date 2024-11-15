import { CanvasDrawer } from "./canvasDrawer.js";

export class Tight3to4CanvasManager {
    private static instance?: Tight3to4CanvasManager;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;

    private mainCanvas: HTMLCanvasElement;
    private mainContext: CanvasRenderingContext2D | null;

    private intermediateCanvas: HTMLCanvasElement;
    private intermediateContext: CanvasRenderingContext2D;

    private intermediateSize: { width: number, height: number } = { width: 0, height: 0 };

    private readonly ElementWidth = 406;
    private readonly ElementHeight = 150;

    private mainWidth = 1;
    private mainHeight = 1;

    private gaps = 0;
    // private targetWidth = 1;
    // private targetHeight = 1;
    // private xOffset = 0;
    // private yOffset = 0;

    private constructor(canvas: HTMLCanvasElement, mainCanvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d", { willReadFrequently: true });
        this.mainCanvas = mainCanvas;
        this.mainContext = mainCanvas.getContext("2d", { willReadFrequently: true });
        this.ElementInit();


        this.intermediateCanvas = document.createElement("canvas");
        this.intermediateContext = this.intermediateCanvas.getContext("2d", { willReadFrequently: true })!;

        this.intermediateCanvas.width = this.mainCanvas.width;
        this.intermediateCanvas.height = this.mainCanvas.height;
    }


    private resetInterToMain() {
        this.intermediateCanvas.width = this.mainCanvas.width;
        this.intermediateCanvas.height = this.mainCanvas.height;
        this.intermediateContext.clearRect(0, 0, this.intermediateCanvas.width, this.intermediateCanvas.height);
        this.intermediateContext.drawImage(this.mainCanvas, 0, 0);
    }

    private ElementInit() {
        this.canvas.style.width = this.ElementWidth + 'px';
        this.canvas.style.height = this.ElementHeight + 'px';
        this.mainWidth = this.mainCanvas.width;
        this.mainHeight = this.mainCanvas.height;

        // const { width: targetW, height: targetH } = this.calcTargetSize(this.mainWidth, this.mainHeight);
        // this.placeInside(this.mainWidth, this.mainHeight);
    }

    private placeInside(innerCanvas: HTMLCanvasElement, innerImageWidth: number, innerImageHeight: number) {
        const innerRatio = innerCanvas.width / innerCanvas.height;
        const outerRatio = this.ElementWidth / this.ElementHeight;

        if (outerRatio > innerRatio) {
            this.canvas.height = innerImageHeight;
            this.canvas.width = innerImageHeight * outerRatio;
        } else {
            this.canvas.width = innerImageWidth;
            this.canvas.height = innerImageWidth / outerRatio;
        }

        const xOffset = Math.round(this.canvas.width / 2 - this.intermediateCanvas.width / 2);
        const yOffset = Math.round(this.canvas.height / 2 - this.intermediateCanvas.height / 2);

        this.context?.drawImage(innerCanvas, xOffset, yOffset);
    }

    public static getInstance(canvas: HTMLCanvasElement, mainCanvas: HTMLCanvasElement): Tight3to4CanvasManager {
        if (!Tight3to4CanvasManager.instance) {
            Tight3to4CanvasManager.instance = new Tight3to4CanvasManager(canvas, mainCanvas);
        }
        return Tight3to4CanvasManager.instance;
    }

    public static destroyInstance() {
        if (Tight3to4CanvasManager.instance) {
            delete Tight3to4CanvasManager.instance;
        }
    }


    update(frameCount: number, gridIsEnabled: boolean, gridGap: number, gridOffset: { x: number, y: number }): string {
        if (!this.context) return "";

        let decoderGaps = 0;
        let frameGaps = 0;

        this.resetInterToMain(); // бновить промежуток

        const drawer = new CanvasDrawer(this.intermediateContext); // рисуем
        let oscilatorGap = 0;

        if (gridIsEnabled) {
            for (let i = 0; i < 13; i++) {
                this.addLogicLineToLeft(drawer, 2, "rgb(150, 150, 150)", gridIsEnabled, gridGap, gridOffset); //декодер
            }
            decoderGaps = this.intermediateCanvas.width - this.mainCanvas.width - 26;
            oscilatorGap = this.isNeedGap(3, gridGap, gridOffset) ?? 0;
            for (let i = 0; i < frameCount; i++) {
                this.addLogicLineToLeft(drawer, 1, "rgb(200, 200, 200)", gridIsEnabled, gridGap, gridOffset); // кадры
                this.addLogicLineToLeft(drawer, 2, "rgb(170, 170, 170)", gridIsEnabled, gridGap, gridOffset);
            }
            // frameGaps = this.gaps - decoderGaps;
        } else {
            drawer.addStripe({ width: 26, direction: "left", color: "rgb(150, 150, 150)" }); //декодер
            drawer.addStripe({ width: 3 * frameCount, direction: "left", color: "rgb(170, 170, 170)" }); // кадры
        }


        drawer.addStripe({ width: 2, direction: "bottom", color: "rgb(120, 220, 120)", lenght: 4, offsetFrom: "end", offset: this.mainCanvas.width + 26 + decoderGaps + oscilatorGap }); // осцилятор

        this.intermediateSize = { width: this.intermediateCanvas.width, height: this.intermediateCanvas.height };

        this.makeGrid(drawer, gridIsEnabled, gridGap, { x: gridOffset.x - this.gaps, y: gridOffset.y });

        this.placeInside(this.intermediateCanvas, this.intermediateCanvas.width, this.intermediateCanvas.height); // вкорячиваем куда надо

        // this.gaps = 0; // сбрасываем gaps
        return "total size: " + this.intermediateCanvas.width + "*" + this.intermediateCanvas.height;

    }

    private addLogicLineToLeft(drawer: CanvasDrawer, width: number, color: string, gridIsEnabled: boolean, gridGap: number, gridOffset: { x: number, y: number }) {
        // const canvas = this.intermediateCanvas.width + 2;
        // let intra = (canvas + gridOffset.x - 2) % gridGap;
        // let extra = gridGap - intra;
        // if (extra > 0 && extra < width) {

        // const realStartOfCurrentBlock = this.intermediateCanvas.width;
        // let gap;

        let offset = gridOffset.x;
        if (offset < 0) { offset = gridGap - Math.abs(offset) % gridGap; }

        const canvas = this.intermediateCanvas.width;
        let intra = (canvas + offset) % gridGap;
        let extra = gridGap - intra;

        if (intra == 0) { extra = 0; } // нюанс расчётов. иначе вместо ноль будет gap.

        if (extra >= 0 && extra < width) {
            let gap = extra % width; // это короче как далеко слева лэп
            gap = gap == 0 ? width : width + extra; // если вот прям лэп
            gap = gap < 2 ? 2 : gap; // отступ должен быть не короче лэпа
            // this.gaps += gap;
            drawer.addStripe({ width: gap, direction: "left", color: "rgba(0, 0, 0, 0)" });
        } else if (intra < 2) {
            let gap = 2 - intra;
            // this.gaps += gap;
            drawer.addStripe({ width: gap, direction: "left", color: "rgba(0, 0, 0, 0)" });
        }

        drawer.addStripe({ width: width, direction: "left", color: color });
    }


    isNeedGap(width: number, gridGap: number, gridOffset: { x: number, y: number }): number | null {

        let offset = gridOffset.x;
        if (offset < 0) { offset = gridGap - Math.abs(offset) % gridGap; }

        const canvas = this.intermediateCanvas.width;
        let intra = (canvas + offset) % gridGap;
        let extra = gridGap - intra;

        if (intra == 0) { extra = 0; } // нюанс расчётов. иначе вместо ноль будет gap.

        if (extra >= 0 && extra < width) {
            let gap = extra % width; // это короче как далеко слева лэп
            gap = gap == 0 ? width : width + extra; // если вот прям лэп
            gap = gap < 2 ? 2 : gap; // отступ должен быть не короче лэпа
            return gap;
        } else if (intra < 2) {
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

    getSize(): { width: number, height: number } {
        return { width: this.intermediateSize.width ?? 0, height: this.intermediateSize.height ?? 0 };
    }

    private makeGrid(drawer: CanvasDrawer, gridIsEnabled: boolean, gridGap: number, gridOffset: { x: number, y: number }) {
        if (!gridIsEnabled) { return; }

        for (let x = this.intermediateCanvas.width + gridGap * 4 - 2; x >= -gridGap * 4 - 2; x -= gridGap) {
            for (let y = -gridGap * 4; y < this.intermediateCanvas.height + gridGap * 4; y += gridGap) {
                drawer.drawSquare(x + gridOffset.x, y + gridOffset.y, 2, 2, "rgb(255, 38, 0)");
            }
        }

    }
}
