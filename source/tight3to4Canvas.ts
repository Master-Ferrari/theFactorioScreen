import { CanvasDrawer } from "./canvasDrawer.js";

export class Tight3to4CanvasManager {
    private static instance: Tight3to4CanvasManager;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;

    private mainCanvas: HTMLCanvasElement;
    private mainContext: CanvasRenderingContext2D | null;

    private intermediateCanvas: HTMLCanvasElement;
    private intermediateContext: CanvasRenderingContext2D;

    private readonly ElementWidth = 330;
    private readonly ElementHeight = 200;

    private mainWidth = 1;
    private mainHeight = 1;
    // private targetWidth = 1;
    // private targetHeight = 1;
    // private xOffset = 0;
    // private yOffset = 0;

    private constructor(canvas: HTMLCanvasElement, mainCanvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.mainCanvas = mainCanvas;
        this.mainContext = mainCanvas.getContext("2d");
        this.ElementInit();


        this.intermediateCanvas = document.createElement('canvas');
        this.intermediateContext = this.intermediateCanvas.getContext('2d')!;

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


    update(frameCount: number): string {
        if (!this.context) return "";

        this.resetInterToMain(); // бновить промежуток

        const drawer = new CanvasDrawer(this.intermediateContext); // рисуем
        drawer.addStripe({ width: 26, direction: "left", color: "rgb(150, 150, 150)" }); //декодер
        // drawer.addStripe({ width: 1, direction: "left", color: "rgba(0, 0, 0, 0)" }); // хз
        drawer.addStripe({ width: 3*frameCount, direction: "left", color: "rgb(170, 170, 170)" }); // кадры
        drawer.addStripe({ width: 2, direction: "bottom", color: "rgb(120, 220, 120)", lenght: 4, offsetFrom: "end", offset: this.mainCanvas.width+26 }); // осцилятор


        this.placeInside(this.intermediateCanvas, this.intermediateCanvas.width, this.intermediateCanvas.height); // вкорячиваем куда надо

        return "total size: " + this.intermediateCanvas.width + "*" + this.intermediateCanvas.height;

    }
}

