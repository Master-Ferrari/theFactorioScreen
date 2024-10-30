// gifDecoder.ts

// Типы данных
type Bitmap = number[][]; // Содержит значения r, g, b для каждого пикселя
type FrameBitmap = { width: number, height: number, bitmap: Bitmap };
type GifBitmap = { width: number, height: number, framesCount: number, fps: number, frames: Bitmap[] };

interface CanvasWithCtx extends HTMLCanvasElement {
    ctx: CanvasRenderingContext2D;
}

interface GifFrame {
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
    frames: GifFrame[];
    comment: string;
    length: number;
    currentFrame: number;
    frameCount: number;
    lastFrame: GifFrame | null;
    image: HTMLCanvasElement | null;
    loadFromArrayBuffer: (arrayBuffer: ArrayBuffer) => void;
    [key: string]: any; // Для дополнительных свойств
}


// Синглтон-класс для управления канвасом
export default class CanvasManager {
    private static instance: CanvasManager;

    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;

    private rotationAngle: number = 0;
    private verticalScale: number = 1;
    private zoomed: boolean = false;

    private originalAspectRatio: number = 1;
    private originalCanvasWidth: number = 1;
    private originalCanvasHeight: number = 1;
    private originalImageWidth: number = 1;
    private originalImageHeight: number = 1;

    private myGif: GifType = this.parseGif();

    // this.myGif = GIF();
    private autoPlayInterval: number = 1;
    private currentFrame: number = 0;

    // Элементы DOM
    private widthInput: HTMLInputElement;
    private heightInput: HTMLInputElement;
    private frameInput: HTMLInputElement;
    private frameCountInput: HTMLInputElement;
    private autoPlayCheckbox: HTMLInputElement;
    private frameRateInput: HTMLInputElement;
    private frameRateDisplay: HTMLElement;
    private preserveAspectCheckbox: HTMLInputElement;
    private alertBox: HTMLElement;

    private constructor() {
        // Инициализация канваса и контекста
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        // Отключение сглаживания изображения
        this.ctx.imageSmoothingEnabled = false;
        (this.ctx as any).mozImageSmoothingEnabled = false;
        (this.ctx as any).webkitImageSmoothingEnabled = false;
        (this.ctx as any).msImageSmoothingEnabled = false;

        // Инициализация элементов DOM
        this.widthInput = document.getElementById("widthInput") as HTMLInputElement;
        this.heightInput = document.getElementById("heightInput") as HTMLInputElement;
        this.frameInput = document.getElementById("frameInput") as HTMLInputElement;
        this.frameCountInput = document.getElementById("frameCountInput") as HTMLInputElement;
        this.autoPlayCheckbox = document.getElementById("autoPlayCheckbox") as HTMLInputElement;
        this.frameRateInput = document.getElementById("frameRateInput") as HTMLInputElement;
        this.frameRateDisplay = document.getElementById("frameRateDisplay") as HTMLElement;
        this.preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox") as HTMLInputElement;
        this.alertBox = document.getElementById("alert") as HTMLElement;
    }

    public static getInstance(): CanvasManager {
        if (!CanvasManager.instance) {
            CanvasManager.instance = new CanvasManager();
        }
        return CanvasManager.instance;
    }

    public loadGif(arrayBuffer: ArrayBuffer): void {
        this.myGif = this.parseGif();
        const self = this;
        this.myGif.onload = function () {

            if (!self.myGif) return;

            // Инициализация свойств
            self.originalAspectRatio = self.myGif.width / self.myGif.height;
            self.originalImageWidth = self.myGif.width;
            self.originalImageHeight = self.myGif.height;

            // Установка размеров канваса
            let newWidth = parseInt(self.widthInput.value, 10);
            let newHeight = parseInt(self.heightInput.value, 10);

            if (isNaN(newWidth) || isNaN(newHeight)) {
                newWidth = self.myGif.width;
                newHeight = self.myGif.height;
                self.widthInput.value = newWidth.toString();
                self.heightInput.value = newHeight.toString();
            }

            if (self.preserveAspectCheckbox.checked) {
                if (isNaN(newWidth) && isNaN(newHeight)) {
                    newWidth = self.myGif.width;
                    newHeight = self.myGif.height;
                } else if (isNaN(newWidth)) {
                    newWidth = newHeight * self.originalAspectRatio;
                    self.widthInput.value = Math.round(newWidth).toString();
                } else if (isNaN(newHeight)) {
                    newHeight = newWidth / self.originalAspectRatio;
                    self.heightInput.value = Math.round(newHeight).toString();
                } else {
                    newHeight = newWidth / self.originalAspectRatio;
                    self.heightInput.value = Math.round(newHeight).toString();
                }
            }

            self.canvas.width = newWidth;
            self.canvas.height = newHeight;

            [self.originalCanvasWidth, self.originalCanvasHeight] = self.ratioCalc(newWidth, newHeight);

            self.canvas.style.width = self.originalCanvasWidth + 'px';
            self.canvas.style.height = self.originalCanvasHeight + 'px';

            // Установка количества кадров
            const totalFrames = self.myGif.frames.length;
            self.frameCountInput.max = totalFrames.toString();
            self.frameCountInput.value = totalFrames.toString();

            // Установка максимального значения для ввода кадра
            self.frameInput.max = (totalFrames - 1).toString();
            self.frameInput.value = '0';

            // Отображение первого кадра
            self.displayFrame(0);

            // Запуск автопроигрывания, если включено
            if (self.autoPlayCheckbox.checked) {
                self.startAutoPlay();
            }

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
            let frame: GifFrame;
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
            frame = {} as GifFrame;
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
            processFrame(frame);
        }

        function processFrame(frame: GifFrame): void {
            // Создаем canvas и приводим его к типу CanvasWithCtx
            const canvas = document.createElement('canvas') as CanvasWithCtx;
            canvas.width = gif.width;
            canvas.height = gif.height;

            // Получаем контекст рисования и сохраняем его в свойство ctx
            canvas.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

            // Сохраняем canvas в frame.image
            frame.image = canvas;

            // Используем frame.image.ctx в дальнейшем коде
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
        const frame = this.myGif.frames[frameNumber];

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

        this.ctx.drawImage(frame.image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        this.ctx.restore();
    }

    // Отображает кадр, определяет текущий индекс и обрабатывает циклическое воспроизведение
    public displayFrame(frameNumber: number): void {
        if (this.myGif && this.myGif.frames.length > 0) {
            const totalFrames = this.myGif.frames.length;

            // Обрабатываем количество кадров для отображения
            let specifiedFrameCount = parseInt(this.frameCountInput.value, 10);
            if (isNaN(specifiedFrameCount) || specifiedFrameCount < 1) {
                specifiedFrameCount = totalFrames;
                this.frameCountInput.value = specifiedFrameCount.toString();
            }

            if (specifiedFrameCount > totalFrames) {
                specifiedFrameCount = totalFrames;
                this.frameCountInput.value = totalFrames.toString();
            }

            // Расчет шага кадров
            const step = totalFrames / specifiedFrameCount;
            let frameIndex = Math.floor(frameNumber * step);
            if (frameIndex >= totalFrames) {
                frameIndex = totalFrames - 1;
            }

            this.currentFrame = frameIndex;
            this.applyFrameTransforms(frameIndex);
        } else {
            alert('Gif не загружен или не содержит кадров.');
        }
    }

    public rotate(angle: number): void {
        this.rotationAngle = (this.rotationAngle + angle) % 360;
        this.rotateStyles();
        this.displayFrame(this.currentFrame);
    }

    private rotateStyles(): void {
        const userWidth = parseInt(this.widthInput.value, 10);
        const userHeight = parseInt(this.heightInput.value, 10);

        this.widthInput.value = userHeight.toString();
        this.heightInput.value = userWidth.toString();

        const maxCanvasWidth = parseInt(getComputedStyle(this.canvas).width);
        const maxCanvasHeight = parseInt(getComputedStyle(this.canvas).height);

        const max = this.zoomed ? 330 : Math.max(maxCanvasWidth, maxCanvasHeight);

        const [newWidth, newHeight] = this.ratioCalc(maxCanvasWidth, maxCanvasHeight, max);

        this.canvas.style.width = newHeight + 'px';
        this.canvas.style.height = newWidth + 'px';
    }

    public mirror(): void {
        this.verticalScale *= -1;
        this.displayFrame(this.currentFrame);
    }

    public scaleCanvas(): void {
        const maxCanvasWidth = parseInt(getComputedStyle(this.canvas).maxWidth);
        const maxCanvasHeight = parseInt(getComputedStyle(this.canvas).maxHeight);

        const userWidth = parseInt(this.widthInput.value, 10);
        const userHeight = parseInt(this.heightInput.value, 10);

        const scaleX = this.originalImageWidth / 330;
        const scaleY = this.originalImageHeight / 330;
        const scale = Math.min(scaleX, scaleY);

        let width = Math.round(this.originalImageWidth * scale);
        let height = Math.round(this.originalImageHeight * scale);

        [width, height] = this.ratioCalc(userWidth, userHeight);

        if (!this.zoomed) {
            this.canvas.style.width = width + 'px';
            this.canvas.style.height = height + 'px';
            this.zoomed = true;
        } else {
            this.canvas.style.width = this.originalCanvasWidth + 'px';
            this.canvas.style.height = this.originalCanvasHeight + 'px';
            this.zoomed = false;
        }

        this.displayFrame(this.currentFrame);
    }
    // Извлекает битмап кадра после применения трансформаций
    public getBitmap(frame: number): Bitmap {
        if (!this.myGif || frame < 0 || frame >= this.myGif.frames.length) {
            throw new Error("Недопустимый номер кадра");
        }

        // this.applyFrameTransforms(frame); // Применяем трансформации перед извлечением битмапа

        console.log("this.canvas.width ", this.canvas.width);

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
        // const frameData = this.myGif.frames[frame];

        return {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            bitmap: bitmap
        };
    }

    public getGifBitmap(): GifBitmap {
        const frames: Bitmap[] = [];
        for (let i = 0; i < this.myGif.frames.length; i++) {
            frames.push(this.getBitmap(i));
        }
        const fps = 1000 / this.myGif.frames[0].delay; // Предполагая, что все кадры имеют одинаковую задержку
        return {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            framesCount: this.myGif.frames.length,
            fps: fps,
            frames: frames
        };
    }

    private ratioCalc(width: number, height: number, max: number = 330): [number, number] {
        const ratio = width / height;
        let newWidth: number;
        let newHeight: number;
        if (ratio > 1) {
            newWidth = max;
            newHeight = Math.round(max / ratio);
        } else {
            newWidth = Math.round(max * ratio);
            newHeight = max;
        }
        return [newWidth, newHeight];
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

    public updateWidth(): void {
        const newWidth = parseInt(this.widthInput.value, 10);
        if (!isNaN(newWidth)) {
            if (this.preserveAspectCheckbox.checked && this.originalAspectRatio) {
                const newHeight = Math.round(newWidth / this.originalAspectRatio);
                this.heightInput.value = newHeight.toString();
            }
            this.originalCanvasWidth = newWidth;
            this.originalCanvasHeight = parseInt(this.heightInput.value, 10);
            this.canvas.width = newWidth;
            this.canvas.height = this.originalCanvasHeight;

            this.canvas.style.width = newWidth + 'px';
            this.canvas.style.height = this.originalCanvasHeight + 'px';
            this.displayFrame(this.currentFrame);
        }
        this.checkAlert();
    }

    public updateHeight(): void {
        const newHeight = parseInt(this.heightInput.value, 10);
        if (!isNaN(newHeight)) {
            if (this.preserveAspectCheckbox.checked && this.originalAspectRatio) {
                const newWidth = Math.round(newHeight * this.originalAspectRatio);
                this.widthInput.value = newWidth.toString();
            }
            this.originalCanvasWidth = parseInt(this.widthInput.value, 10);
            this.originalCanvasHeight = newHeight;
            this.canvas.width = this.originalCanvasWidth;
            this.canvas.height = newHeight;

            this.canvas.style.width = this.originalCanvasWidth + 'px';
            this.canvas.style.height = newHeight + 'px';
            this.displayFrame(this.currentFrame);
        }
        this.checkAlert();
    }

    public updateFrameInput(): void {
        if (!this.autoPlayCheckbox.checked) {
            const frameNumber = parseInt(this.frameInput.value, 10) || 0;
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
    }

    public startAutoPlay(): void {
        clearInterval(this.autoPlayInterval);
        let frameNumber = parseInt(this.frameInput.value, 10) || 0;
        const fps = parseInt(this.frameRateInput.value, 10);
        const interval = 1000 / fps;

        this.autoPlayInterval = window.setInterval(() => {
            frameNumber++;
            const specifiedFrameCount = parseInt(this.frameCountInput.value, 10);
            const totalFrames = this.myGif.frames.length;

            if (isNaN(specifiedFrameCount) || specifiedFrameCount < 1) {
                this.frameCountInput.value = totalFrames.toString();
            }

            if (frameNumber >= specifiedFrameCount) {
                frameNumber = 0;
            }
            this.frameInput.value = frameNumber.toString();
            this.displayFrame(frameNumber);
        }, interval);
    }

    public updateFrameRate(): void {
        const fps = parseInt(this.frameRateInput.value, 10);
        this.frameRateDisplay.textContent = fps + ' FPS';
        if (this.autoPlayCheckbox.checked) {
            this.startAutoPlay();
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



