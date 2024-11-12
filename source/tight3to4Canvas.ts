import { canvasDrower } from "./canvasDrower";

export class Tight3to4CanvasManager {
    private static instance: Tight3to4CanvasManager;
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D | null;

    private mainCanvas: HTMLCanvasElement;
    private mainContext: CanvasRenderingContext2D | null;

    private readonly ElementWidth = 330;
    private readonly ElementHeight = 200;

    private mainWidth = 1;
    private mainHeight = 1;
    private targetWidth = 1;
    private targetHeight = 1;
    private xOffset = 0;
    private yOffset = 0;

    private constructor(canvas: HTMLCanvasElement, mainCanvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.mainCanvas = mainCanvas;
        this.mainContext = mainCanvas.getContext("2d");
        this.ElementInit();
    }

    private ElementInit() {
        this.canvas.style.width = this.ElementWidth + 'px';
        this.canvas.style.height = this.ElementHeight + 'px';
        this.mainWidth = this.mainCanvas.width;
        this.mainHeight = this.mainCanvas.height;

        const { width: targetW, height: targetH } = this.calcTargetSize(this.mainWidth, this.mainHeight);
        this.resizeCanvas(targetW, targetH);
    }

    private resizeCanvas(myTargetWidth: number, myTargetHeight: number) {
        const mainRatio = this.mainWidth / this.mainHeight;
        const targetRatio = this.ElementWidth / this.ElementHeight;

        if (targetRatio > mainRatio) {
            this.canvas.height = myTargetHeight;
            this.canvas.width = myTargetHeight * targetRatio;
        } else {
            this.canvas.width = myTargetWidth;
            this.canvas.height = myTargetWidth / targetRatio;
        }


        this.xOffset = Math.round(this.canvas.width / 2 - this.mainWidth / 2);
        this.yOffset = Math.round(this.canvas.height / 2 - this.mainHeight / 2);

    }

    public static getInstance(canvas: HTMLCanvasElement, mainCanvas: HTMLCanvasElement): Tight3to4CanvasManager {
        if (!Tight3to4CanvasManager.instance) {
            Tight3to4CanvasManager.instance = new Tight3to4CanvasManager(canvas, mainCanvas);
        }
        return Tight3to4CanvasManager.instance;
    }

    public clearCanvas(): void {
        if (this.context) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    public drawText(text: string, x: number, y: number): void {
        if (this.context) {
            this.context.font = "20px Arial";
            this.context.fillStyle = "black";
            this.context.fillText(text, x, y);
        }
    }

    public drawRectangle(x: number, y: number, width: number, height: number, color: string = "blue"): void {
        if (this.context) {
            this.context.fillStyle = color;
            this.context.fillRect(x, y, width, height);
        }
    }

    public copyFromMain() {
        this.context?.drawImage(this.mainCanvas, this.xOffset, this.yOffset);
    }

    private calcTargetSize(width: number, height: number): { width: number, height: number } {
        this.targetWidth = width;
        this.targetHeight = height;

        return { width: this.targetWidth, height: this.targetHeight };
    }

    update(): void {
        if (this.mainWidth != this.mainCanvas.width || this.mainHeight != this.mainCanvas.height) {
            this.mainWidth = this.mainCanvas.width;
            this.mainHeight = this.mainCanvas.height;
            const { width: targetW, height: targetH } = this.calcTargetSize(this.mainWidth, this.mainHeight);
            this.resizeCanvas(targetW, targetH);
        }

        if(!this.context) return;

        const drower = new canvasDrower(this.context);
        // drower.make(AddStripe)

        this.copyFromMain();
    }
}

