import { parse } from "path";
import { Method } from "./method";

type Bitmap = number[][];
type FrameBitmap = { width: number, height: number, bitmap: Bitmap };
export type GifBitmap = { width: number, height: number, framesCount: number, fps: number, tpf: number, frames: Bitmap[] };

interface CanvasWithCtx extends HTMLCanvasElement {
    ctx: CanvasRenderingContext2D;
}

interface Frame {
    disposalMethod: number;
    time: number;
    delay: number;
    transparencyIndex?: number;
    leftPos: number;
    topPos: number;
    width: number;
    height: number;
    localColourTableFlag: boolean;
    localColourTable?: number[][];
    interlaced: boolean;
    image: CanvasWithCtx;
}

interface GifType {
    onload: (() => void) | null;
    onerror: ((type: string) => void) | null;
    loading: boolean;
    width: number;
    height: number;
    frames: Frame[];
    comment: string;
    length: number;
    currentFrame: number;
    frameCount: number;
    lastFrame: Frame | null;
    image: HTMLCanvasElement | null;
    loadFromArrayBuffer: (arrayBuffer: ArrayBuffer) => void;
    [key: string]: any;
}

interface PngType {
    onload: (() => void) | null;
    onerror: ((type: string) => void) | null;
    loading: boolean;
    width: number;
    height: number;
    image: HTMLCanvasElement | null;
    frame: Frame | null;
    loadFromArrayBuffer: (arrayBuffer: ArrayBuffer) => void;
}


type LoaderTypes = {
    mode: "gif",
    arrayBuffer: ArrayBuffer
} | {
    mode: "png",
    arrayBuffer: ArrayBuffer
}
export type Mode = "gif" | "png" | null;
type OnLoadCallback = (mode: Mode) => void;


export default class ImageProcessor {
    private static instance: ImageProcessor;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private _mode: Mode = null;
    private onLoadCallback: OnLoadCallback | null = null;

    private canvasSize: number = 330;

    private rotationAngle: number = 0;
    private verticalScale: number = 1;
    private zoomed: boolean = false;

    private originalAspectRatio: number = 1;
    private originalCanvasWidth: number = 1;
    private originalCanvasHeight: number = 1;
    private originalImageWidth: number = 1;
    private originalImageHeight: number = 1;

    private myGif: GifType = this.parseGif();
    private myPng: PngType = this.parsePng();

    private autoPlayInterval: number = 1;
    private currentOriginFrame: number = 0;
    private currentLocalFrame: number = 0;
    private frameRatio: number = 1;

    private tpf: number = 4;
    private fps: number = 15;

    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private frameInput: HTMLInputElement;
    private frameCountInput: HTMLInputElement;
    private autoPlayCheckbox: HTMLInputElement;
    private frameRateInput: HTMLInputElement;
    private frameRateDisplay: HTMLElement;
    private preserveAspectCheckbox: HTMLInputElement;
    private alertBox: HTMLElement;

    private method: Method | null = null;

    get mode() { return this._mode; }

    private constructor() {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

        this.ctx.imageSmoothingEnabled = false;
        (this.ctx as any).mozImageSmoothingEnabled = false;
        (this.ctx as any).webkitImageSmoothingEnabled = false;
        (this.ctx as any).msImageSmoothingEnabled = false;

        this.widthInput = document.getElementById("widthInput") as HTMLInputElement;
        this.heightInput = document.getElementById("heightInput") as HTMLInputElement;
        this.frameInput = document.getElementById("frameInput") as HTMLInputElement;
        this.frameCountInput = document.getElementById("frameCountInput") as HTMLInputElement;
        this.autoPlayCheckbox = document.getElementById("autoPlayCheckbox") as HTMLInputElement;
        this.frameRateInput = document.getElementById("frameRateInput") as HTMLInputElement;
        this.frameRateDisplay = document.getElementById("frameRateDisplay") as HTMLElement;
        this.preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox") as HTMLInputElement;
        this.alertBox = document.getElementById("alert") as HTMLElement;

        // this.frameRatioCalc();
    }

    public loader(options: LoaderTypes): void {
        this._mode = options.mode;
        this.verticalScale = 1;
        this.rotationAngle = 0;

        if (options.mode === "gif") {
            this.loadGif(options.arrayBuffer);
        } else if (options.mode === "png") {
            this.loadPng(options.arrayBuffer);
        }

    }

    public setOnLoadCallback(callback: OnLoadCallback): void {
        this.onLoadCallback = callback;
    }

    public static getInstance(): ImageProcessor {
        if (!ImageProcessor.instance) {
            ImageProcessor.instance = new ImageProcessor();
        }
        return ImageProcessor.instance;
    }

    changeMethod(newMethod: Method) {
        this.method = newMethod;
    }

    private loadPng(arrayBuffer: ArrayBuffer): void {
        this.myPng = this.parsePng();
        const self = this;

        this.myPng.onload = function () {
            if (!self.myPng) return;

            // Переменные
            let imageWidth = self.myPng.width;
            let imageHeight = self.myPng.height;
            let [canvasWidth, canvasHeight] = self.ratioCalc(imageWidth, imageHeight);

            // original щит
            self.originalAspectRatio = imageWidth / imageHeight;
            self.originalImageWidth = imageWidth;
            self.originalImageHeight = imageHeight;
            self.originalCanvasWidth = canvasWidth;
            self.originalCanvasHeight = canvasHeight;

            // рычажки
            self.widthInput.value = imageWidth.toString();
            self.heightInput.value = imageHeight.toString();

            // image size
            self.canvas.width = imageWidth;
            self.canvas.height = imageHeight;

            // canvas size
            self.canvas.style.width = canvasWidth + 'px';
            self.canvas.style.height = canvasHeight + 'px';

            if (self.myPng.frame?.image) {
                const ctx = self.canvas.getContext("2d", { willReadFrequently: true })!;
                ctx.drawImage(self.myPng.frame.image, 0, 0, imageWidth, imageHeight);
            }
            self.onLoadCallback?.(self._mode);
        };

        this.myPng.loadFromArrayBuffer(arrayBuffer);
    }


    private parsePng(): PngType {
        const png: PngType = {
            onload: null,
            onerror: null,
            loading: true,
            width: 0,
            height: 0,
            frame: null,
            image: null,
            loadFromArrayBuffer: function (arrayBuffer: ArrayBuffer) {
                const img = new Image();
                img.onload = () => {
                    this.width = img.width;
                    this.height = img.height;

                    // Создаем canvas для изображения и устанавливаем его в frame.image
                    const canvas = document.createElement('canvas') as CanvasWithCtx;
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
                    ctx.drawImage(img, 0, 0);
                    canvas.ctx = ctx; // Привязываем контекст к canvas

                    // Инициализируем frame для PNG
                    this.frame = {
                        disposalMethod: 0,
                        time: 0,
                        delay: 0,
                        leftPos: 0,
                        topPos: 0,
                        width: this.width,
                        height: this.height,
                        localColourTableFlag: false,
                        interlaced: false,
                        image: canvas
                    };

                    this.image = canvas;
                    this.loading = false;

                    if (typeof this.onload === "function") {
                        this.onload();
                    }
                };

                img.onerror = () => {
                    this.loading = false;
                    if (typeof this.onerror === "function") {
                        this.onerror("Ошибка загрузки PNG");
                    }
                };

                // Преобразуем ArrayBuffer в URL для загрузки изображения
                const blob = new Blob([arrayBuffer], { type: 'image/png' });
                img.src = URL.createObjectURL(blob);
            }
        };

        return png;
    }

    private loadGif(arrayBuffer: ArrayBuffer): void {
        this.myGif = this.parseGif();
        const self = this;
        this.myGif.onload = function () {
            if (!self.myGif) return;

            // Переменные
            let imageWidth = self.myGif.width;
            let imageHeight = self.myGif.height;
            let [canvasWidth, canvasHeight] = self.ratioCalc(imageWidth, imageHeight);

            // original щит
            self.originalAspectRatio = imageWidth / imageHeight;
            self.originalImageWidth = imageWidth;
            self.originalImageHeight = imageHeight;
            self.originalCanvasWidth = canvasWidth;
            self.originalCanvasHeight = canvasHeight;

            // рычажки
            self.widthInput.value = imageWidth.toString();
            self.heightInput.value = imageHeight.toString();

            // image size
            self.canvas.width = imageWidth;
            self.canvas.height = imageHeight;

            // canvas size
            self.canvas.style.width = canvasWidth + 'px';
            self.canvas.style.height = canvasHeight + 'px';

            // Установка количества кадров
            const totalFrames = self.myGif.frames.length;
            self.frameCountInput.max = totalFrames.toString();
            self.frameCountInput.value = totalFrames.toString();

            self.frameInput.max = (totalFrames - 1).toString();
            self.frameInput.value = '0';

            self.displayFrame(0);

            if (self.autoPlayCheckbox.checked) {
                self.startAutoPlay();
            }

            self.onLoadCallback?.(self._mode);
            self.checkAlert();
        };
        this.myGif.loadFromArrayBuffer(arrayBuffer);
    }

    private parseGif(): GifType {
        // Весь код функции GIF без изменений, только с добавлением типов

        let st: any;
        const interlaceOffsets = [0, 4, 2, 1];
        const interlaceSteps = [8, 8, 4, 2];
        let interlacedBufSize: number = 0;
        let deinterlaceBuf: Uint8Array = new Uint8Array(0);
        let pixelBufSize: number = 0;
        let pixelBuf: Uint8Array = new Uint8Array(0);

        const GIF_FILE = {
            GCExt: 0xF9,
            COMMENT: 0xFE,
            APPExt: 0xFF,
            UNKNOWN: 0x01,
            IMAGE: 0x2C,
            EOF: 59,
            EXT: 0x21,
        };

        class Stream {
            data: Uint8ClampedArray;
            pos: number;
            constructor(data: ArrayBuffer) {
                this.data = new Uint8ClampedArray(data);
                this.pos = 0;
            }
            getString(count: number): string {
                let s = "";
                while (count--) {
                    s += String.fromCharCode(this.data[this.pos++]);
                }
                return s;
            }
            readSubBlocks(): string {
                let size: number;
                let count: number;
                let data = "";
                do {
                    count = size = this.data[this.pos++];
                    while (count--) {
                        data += String.fromCharCode(this.data[this.pos++]);
                    }
                } while (size !== 0 && this.pos < this.data.length);
                return data;
            }
            readSubBlocksB(): number[] {
                let size: number;
                let count: number;
                const data: number[] = [];
                do {
                    count = size = this.data[this.pos++];
                    while (count--) {
                        data.push(this.data[this.pos++]);
                    }
                } while (size !== 0 && this.pos < this.data.length);
                return data;
            }
        }

        function lzwDecode(minSize: number, data: number[]): void {
            let i: number,
                pixelPos: number,
                pos: number,
                clear: number,
                eod: number,
                size: number,
                done: boolean,
                dic: number[][],
                code: number = 0,
                last: number,
                d: number[],
                len: number;
            pos = pixelPos = 0;
            dic = [];
            clear = 1 << minSize;
            eod = clear + 1;
            size = minSize + 1;
            done = false;
            while (!done) {
                last = code;
                code = 0;
                for (i = 0; i < size; i++) {
                    if (data[pos >> 3] & (1 << (pos & 7))) {
                        code |= 1 << i;
                    }
                    pos++;
                }
                if (code === clear) {
                    dic = [];
                    size = minSize + 1;
                    for (i = 0; i < clear; i++) {
                        dic[i] = [i];
                    }
                    dic[clear] = [];
                    dic[eod] = null as any;
                } else {
                    if (code === eod) {
                        done = true;
                        return;
                    }
                    if (code >= dic.length) {
                        dic.push(dic[last].concat(dic[last][0]));
                    } else if (last !== clear) {
                        dic.push(dic[last].concat(dic[code][0]));
                    }
                    d = dic[code];
                    len = d.length;
                    for (i = 0; i < len; i++) {
                        pixelBuf[pixelPos++] = d[i];
                    }
                    if (dic.length === (1 << size) && size < 12) {
                        size++;
                    }
                }
            }
        }

        function parseColourTable(count: number): number[][] {
            const colours = [];
            for (let i = 0; i < count; i++) {
                colours.push([st.data[st.pos++], st.data[st.pos++], st.data[st.pos++]]);
            }
            return colours;
        }

        function parse(): void {
            let bitField: number;
            st.pos += 6;
            gif.width = st.data[st.pos++] + (st.data[st.pos++] << 8);
            gif.height = st.data[st.pos++] + (st.data[st.pos++] << 8);
            bitField = st.data[st.pos++];
            gif.colorRes = (bitField & 0b1110000) >> 4;
            gif.globalColourCount = 1 << ((bitField & 0b111) + 1);
            gif.bgColourIndex = st.data[st.pos++];
            st.pos++;
            if (bitField & 0b10000000) {
                gif.globalColourTable = parseColourTable(gif.globalColourCount);
            }
            setTimeout(parseBlock, 0);
        }

        function parseAppExt(): void {
            st.pos += 1;
            if ('NETSCAPE' === st.getString(8)) {
                st.pos += 8;
            } else {
                st.pos += 3;
                st.readSubBlocks();
            }
        }

        function parseGCExt(): void {
            let bitField: number;
            st.pos++;
            bitField = st.data[st.pos++];
            gif.disposalMethod = (bitField & 0b11100) >> 2;
            gif.transparencyGiven = !!(bitField & 0b1);
            gif.delayTime = st.data[st.pos++] + (st.data[st.pos++] << 8);
            gif.transparencyIndex = st.data[st.pos++];
            st.pos++;
        }

        function parseImg(): void {
            let frame: Frame;
            let bitField: number;
            const deinterlace = function (width: number) {
                let lines: number, fromLine: number, pass: number, toLine: number;
                lines = pixelBufSize / width;
                fromLine = 0;
                if (interlacedBufSize !== pixelBufSize) {
                    deinterlaceBuf = new Uint8Array(pixelBufSize);
                    interlacedBufSize = pixelBufSize;
                }
                for (pass = 0; pass < 4; pass++) {
                    for (toLine = interlaceOffsets[pass]; toLine < lines; toLine += interlaceSteps[pass]) {
                        deinterlaceBuf.set(pixelBuf.subarray(fromLine, fromLine + width), toLine * width);
                        fromLine += width;
                    }
                }
            };
            frame = {} as Frame;
            gif.frames.push(frame);
            frame.disposalMethod = gif.disposalMethod;
            frame.time = gif.length;
            frame.delay = gif.delayTime * 10;
            gif.length += frame.delay;
            if (gif.transparencyGiven) {
                frame.transparencyIndex = gif.transparencyIndex;
            } else {
                frame.transparencyIndex = undefined;
            }
            frame.leftPos = st.data[st.pos++] + (st.data[st.pos++] << 8);
            frame.topPos = st.data[st.pos++] + (st.data[st.pos++] << 8);
            frame.width = st.data[st.pos++] + (st.data[st.pos++] << 8);
            frame.height = st.data[st.pos++] + (st.data[st.pos++] << 8);
            bitField = st.data[st.pos++];
            frame.localColourTableFlag = !!(bitField & 0b10000000);
            if (frame.localColourTableFlag) {
                frame.localColourTable = parseColourTable(1 << ((bitField & 0b111) + 1));
            }
            if (pixelBufSize !== frame.width * frame.height) {
                pixelBuf = new Uint8Array(frame.width * frame.height);
                pixelBufSize = frame.width * frame.height;
            }
            lzwDecode(st.data[st.pos++], st.readSubBlocksB());
            if (bitField & 0b1000000) {
                frame.interlaced = true;
                deinterlace(frame.width);
            } else {
                frame.interlaced = false;
            }
            processGifFrame(frame);
        }

        function processGifFrame(frame: Frame): void {
            const canvas = document.createElement('canvas') as CanvasWithCtx;
            canvas.width = gif.width;
            canvas.height = gif.height;

            canvas.ctx = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;

            frame.image = canvas;

            const ct = frame.localColourTableFlag ? frame.localColourTable! : gif.globalColourTable;

            if (gif.lastFrame === null) {
                gif.lastFrame = frame;
            }

            const useT = gif.lastFrame.disposalMethod === 2 || gif.lastFrame.disposalMethod === 3;

            if (!useT) {
                frame.image.ctx.drawImage(gif.lastFrame.image, 0, 0, gif.width, gif.height);
            }

            const cData = frame.image.ctx.getImageData(frame.leftPos, frame.topPos, frame.width, frame.height);
            const dat = cData.data;

            const pDat = frame.interlaced ? deinterlaceBuf : pixelBuf;
            const pixCount = pDat.length;
            let ind = 0;
            const ti = frame.transparencyIndex;

            for (let i = 0; i < pixCount; i++) {
                const pixel = pDat[i];
                const col = ct[pixel];
                if (ti !== pixel) {
                    dat[ind++] = col[0];
                    dat[ind++] = col[1];
                    dat[ind++] = col[2];
                    dat[ind++] = 255;
                } else if (useT) {
                    dat[ind + 3] = 0;
                    ind += 4;
                } else {
                    ind += 4;
                }
            }

            frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);
            gif.lastFrame = frame;
        }


        function finished(): void {
            gif.loading = false;
            gif.frameCount = gif.frames.length;
            gif.lastFrame = null;
            st = undefined;
            gif.complete = true;
            gif.disposalMethod = undefined;
            gif.transparencyGiven = undefined;
            gif.delayTime = undefined;
            gif.transparencyIndex = undefined;
            gif.waitTillDone = undefined;
            pixelBuf = new Uint8Array(0);
            deinterlaceBuf = new Uint8Array(0);
            pixelBufSize = 0;
            interlacedBufSize = 0;
            gif.currentFrame = 0;
            if (gif.frames.length > 0) {
                gif.image = gif.frames[0].image;
            }
            if (typeof gif.onload === "function") {
                gif.onload();
            }
        }

        function parseExt(): void {
            const blockID = st.data[st.pos++];
            if (blockID === GIF_FILE.GCExt) {
                parseGCExt();
            } else if (blockID === GIF_FILE.COMMENT) {
                gif.comment += st.readSubBlocks();
            } else if (blockID === GIF_FILE.APPExt) {
                parseAppExt();
            } else {
                if (blockID === GIF_FILE.UNKNOWN) {
                    st.pos += 13;
                }
                st.readSubBlocks();
            }
        }

        function parseBlock(): void {
            const blockId = st.data[st.pos++];
            if (blockId === GIF_FILE.IMAGE) {
                parseImg();
            } else if (blockId === GIF_FILE.EOF) {
                finished();
                return;
            } else {
                parseExt();
            }
            setTimeout(parseBlock, 0);
        }

        function error(type: string): void {
            if (typeof gif.onerror === "function") {
                gif.onerror(type);
            }
            gif.loading = false;
        }

        function dataLoaded(data: ArrayBuffer): void {
            st = new Stream(data);
            parse();
        }

        function loadFromArrayBuffer(arrayBuffer: ArrayBuffer): void {
            dataLoaded(arrayBuffer);
        }

        const gif: GifType = {
            onload: null,
            onerror: null,
            loading: false,
            width: 0,
            height: 0,
            frames: [],
            comment: "",
            length: 0,
            currentFrame: 0,
            frameCount: 0,
            lastFrame: null,
            image: null,
            loadFromArrayBuffer: loadFromArrayBuffer,
        };

        return gif;
    }

    // Применяет трансформации кадра на канвасе
    public applyFrameTransforms(frameNumber: number): void {

        let image: CanvasWithCtx | HTMLCanvasElement;
        if (this.mode == "gif") {
            image = this.myGif.frames[frameNumber].image;
        } else {
            image = this.myPng.image!;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Подготовка канваса к трансформациям
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(1, this.verticalScale);
        this.ctx.rotate((this.rotationAngle * Math.PI) / 180);

        // Определение ширины и высоты для отрисовки
        let drawWidth = this.canvas.width;
        let drawHeight = this.canvas.height;

        // Меняем ширину и высоту при угле поворота 90 или 270 градусов
        if (this.rotationAngle % 180 !== 0) {
            [drawWidth, drawHeight] = [drawHeight, drawWidth];
        }

        this.ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        this.ctx.restore();
    }

    private frameRatioCalc() {
        const localCount = parseInt(this.frameCountInput.value, 10);
        const originCount = this.myGif.frames.length;
        this.frameRatio = originCount / localCount;
    }

    private originToLocal(originFrame: number): number {
        if (!this.myGif) return 0;
        return Math.floor(originFrame / this.frameRatio);
    }

    private localToOrigin(local: number) {
        if (!this.myGif) return 0;
        return Math.floor(local * this.frameRatio);
    }

    public displayFrame(frameNumber: number = this.currentOriginFrame): void {
        if (this.myGif && this.myGif.frames.length > 0 || this.myPng) {


            const totalFrames = this._mode == "gif" ? this.myGif.frames.length : 1;

            // чек границ по кадрам
            let specifiedFrameCount = parseInt(this.frameCountInput.value, 10);
            if (isNaN(specifiedFrameCount) || specifiedFrameCount < 1) {
                specifiedFrameCount = totalFrames;
                this.frameCountInput.value = specifiedFrameCount.toString();
            }

            if (specifiedFrameCount > totalFrames) {
                specifiedFrameCount = totalFrames;
                this.frameCountInput.value = totalFrames.toString();
            }

            this.currentOriginFrame = frameNumber;
            this.currentLocalFrame = this.originToLocal(frameNumber);

            this.applyFrameTransforms(frameNumber);
        } else if (this.myPng) {
            this.currentOriginFrame = 0;
            this.currentLocalFrame = 0;
            this.applyFrameTransforms(0);
        } else {
            alert('Файл не загружен или содержит ошибки.');
        }


        this.method?.update({
            frameCount: parseInt(this.frameCountInput.value, 10),
            currentFrame: this.currentLocalFrame,
            mode: this.mode
        });
    }


    public rotate(angle: number): void {
        angle = this.verticalScale == 1 ? angle : -angle; // так надо
        this.rotationAngle = (this.rotationAngle + angle) % 360;
        // повороты бывают только на 90 так что..
        [this.canvas.width, this.canvas.height] = [this.canvas.height, this.canvas.width]; // поменять пропорции
        [this.canvas.style.width, this.canvas.style.height] = [this.canvas.style.height, this.canvas.style.width];
        [this.widthInput.value, this.heightInput.value] = [this.heightInput.value, this.widthInput.value];

        this.displayFrame();
    }

    public mirror(): void {
        this.verticalScale *= -1;
        this.displayFrame();
    }

    public zoomCanvas(zoomed: boolean): void {

        this.zoomed = zoomed;

        let canvasWidth = parseInt(getComputedStyle(this.canvas).maxWidth); // размер стилей
        let canvasHeight = parseInt(getComputedStyle(this.canvas).maxHeight);

        let imageWidth, imageHeight;

        imageWidth = this.canvas.width;
        imageHeight = this.canvas.height;

        [canvasWidth, canvasHeight] = this.ratioCalc(imageWidth, imageHeight, zoomed);
        this.canvas.style.width = canvasWidth + 'px';
        this.canvas.style.height = canvasHeight + 'px';



        this.displayFrame(this.currentOriginFrame);
    }

    // Извлекает битмап кадра после применения трансформаций
    private getBitmap(frame: number): Bitmap {
        if ((!this.myGif || frame < 0 || frame >= this.myGif.frames.length) && (!this.myPng)) {
            throw new Error("Недопустимый номер кадра");
        }

        if (frame != this.currentOriginFrame) { // перерендер если надо
            this.displayFrame(frame);
        }

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const bitmap: Bitmap = [];

        // Создаем битмап из данных изображения
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            bitmap.push([r, g, b]);
        }

        return bitmap;
    }


    public getFrameBitmap(frame: number): FrameBitmap {
        const bitmap = this.getBitmap(frame);

        return {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            bitmap: bitmap
        };
    }

    public getGifBitmap(): GifBitmap {
        const bitmaps: Bitmap[] = [];
        const actualFrameArray = this.getLocalFrameArray();
        for (let i = 0; i < actualFrameArray.length; i++) {
            bitmaps.push(this.getBitmap(actualFrameArray[i]));
        }

        return {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            framesCount: this.myGif.frames.length,
            fps: this.fps,
            tpf: this.tpf,
            frames: bitmaps
        };
    }

    private checkAlert(): void {
        const widthUserInput = parseInt(this.widthInput.value, 10);
        const framesUserInput = parseInt(this.frameCountInput.value, 10);

        const signals = widthUserInput * 0.25 * 3 * framesUserInput;

        if (signals > 400) {
            this.alertBox.style.display = "block";
        } else {
            this.alertBox.style.display = "none";
        }
    }

    private ratioCalc(width: number, height: number, zoomed: boolean = this.zoomed): [number, number] {

        const ratio = width / height;
        let newWidth: number;
        let newHeight: number;

        let max = zoomed ? this.canvasSize : Math.max(width, height);
        max = Math.min(max, this.canvasSize);

        if (ratio > 1) {
            newWidth = max;
            newHeight = Math.round(max / ratio);
        } else {
            newWidth = Math.round(max * ratio);
            newHeight = max;
        }

        return [newWidth, newHeight];
    }

    public updateCanvasSize(byChanging: "width" | "height"): void {
        let newWidth = parseInt(this.widthInput.value, 10);
        let newHeight = parseInt(this.heightInput.value, 10);



        if (!isNaN(newWidth) && !isNaN(newHeight)) {

            if (this.preserveAspectCheckbox.checked && this.originalAspectRatio) {

                if (byChanging === "width") {
                    newHeight = Math.round(newWidth / this.originalAspectRatio);
                    this.heightInput.value = newHeight.toString();
                } else {
                    newWidth = Math.round(newHeight * this.originalAspectRatio);
                    this.widthInput.value = newWidth.toString();
                }

            }
            this.originalCanvasWidth = newWidth;
            this.originalCanvasHeight = newHeight;
            this.canvas.width = newWidth;
            this.canvas.height = newHeight;

            const max = this.zoomed ? this.canvasSize : Math.max(newWidth, newHeight);
            const [calcWidth, calcHeight] = this.ratioCalc(newWidth, newHeight);

            this.canvas.style.width = calcWidth + 'px';
            this.canvas.style.height = calcHeight + 'px';

            this.displayFrame();
        }
        this.checkAlert();
    }

    public updateFrameInput(): void {
        if (this._mode === "png") {
            this.frameInput.value = '0';
        }
        if (!this.autoPlayCheckbox.checked) {
            const frameNumber = this.localToOrigin(parseInt(this.frameInput.value, 10)) || 0;
            this.displayFrame(frameNumber);
        }
    }

    public updateFrameCount(): void {
        if (!this.myGif) return;
        let specifiedFrameCount = parseInt(this.frameCountInput.value, 10);
        const totalFrames = this.myGif.frames.length;

        if (isNaN(specifiedFrameCount) || specifiedFrameCount < 1) {
            specifiedFrameCount = totalFrames;
            this.frameCountInput.value = specifiedFrameCount.toString();
        }

        if (specifiedFrameCount > totalFrames) {
            specifiedFrameCount = totalFrames;
            this.frameCountInput.value = totalFrames.toString();
        }

        this.frameInput.max = (specifiedFrameCount - 1).toString();
        this.frameInput.value = '0';
        this.displayFrame(0);
        this.checkAlert();
        this.frameRatioCalc();
    }

    private getLocalFrameArray(): number[] {
        if (!this.myGif) return [0];

        const totalFrames = this.myGif.frames.length;

        let userFrameCount = parseInt(this.frameCountInput.value, 10);
        userFrameCount = isNaN(userFrameCount) || userFrameCount < 1
            ? totalFrames : userFrameCount;

        const outFrames = [];

        for (let i = 0; i < userFrameCount; i++) {
            outFrames.push(Math.floor(i * this.frameRatio));
        }

        return outFrames;
    }


    public startAutoPlay(): void {
        if (!this.myGif) return;

        clearInterval(this.autoPlayInterval);

        let fps = this.fps;
        let interval = 1000 / (60 / this.tpf);

        const oldFrameCount = parseInt(this.frameCountInput.value, 10);

        let frameIndex = this.localToOrigin(parseInt(this.frameInput.value, 10)) || 0;
        let actualFrameArray = this.getLocalFrameArray();

        this.autoPlayInterval = window.setInterval(() => {
            if (parseInt(this.frameCountInput.value, 10) != oldFrameCount) { // кеширование или типа того
                actualFrameArray = this.getLocalFrameArray();
            }
            if (fps != this.fps) { // тож самое
                fps = this.fps;
                interval = 1000 / (60 / this.tpf);
            }
            frameIndex = (frameIndex + 1) % actualFrameArray.length; //типа цикл
            const newFrame = actualFrameArray[frameIndex];
            this.currentOriginFrame = newFrame;
            this.currentLocalFrame = this.originToLocal(newFrame);
            this.frameInput.value = this.originToLocal(newFrame).toString();
            this.displayFrame(newFrame);
        }, interval);
    }


    public updateFrameRate(): void {
        this.tpf = parseInt(this.frameRateInput.value, 10);
        this.fps = Math.round(60 / this.tpf);
        this.frameRateDisplay.textContent = formatNumber(this.tpf) + " ticks/frame (" + formatNumber(this.fps) + " FPS)";
        if (this.autoPlayCheckbox.checked) {
            this.startAutoPlay();
        }

        function formatNumber(num: number): string {
            const str = num.toString();
            return str.length === 1 ? '_' + str : str;
        }
    }

    public toggleAutoPlay(): void {
        if (this.autoPlayCheckbox.checked) {
            this.startAutoPlay();
        } else {
            clearInterval(this.autoPlayInterval);
        }
    }
}



