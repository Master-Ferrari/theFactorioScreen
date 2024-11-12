export default class ImageProcessor {
    get mode() { return this._mode; }
    constructor() {
        this._mode = null;
        this.onLoadCallback = null;
        this.canvasSize = 330;
        this.rotationAngle = 0;
        this.verticalScale = 1;
        this.zoomed = false;
        this.originalAspectRatio = 1;
        this.originalCanvasWidth = 1;
        this.originalCanvasHeight = 1;
        this.originalImageWidth = 1;
        this.originalImageHeight = 1;
        this.myGif = this.parseGif();
        this.myPng = this.parsePng();
        this.autoPlayInterval = 1;
        this.currentOriginFrame = 0;
        this.currentLocalFrame = 0;
        this.frameRatio = 1;
        this.tpf = 4;
        this.fps = 15;
        this.method = null;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        this.widthInput = document.getElementById("widthInput");
        this.heightInput = document.getElementById("heightInput");
        this.frameInput = document.getElementById("frameInput");
        this.frameCountInput = document.getElementById("frameCountInput");
        this.autoPlayCheckbox = document.getElementById("autoPlayCheckbox");
        this.frameRateInput = document.getElementById("frameRateInput");
        this.frameRateDisplay = document.getElementById("frameRateDisplay");
        this.preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox");
        this.alertBox = document.getElementById("alert");
        // this.frameRatioCalc();
    }
    loader(options) {
        this._mode = options.mode;
        this.verticalScale = 1;
        this.rotationAngle = 0;
        if (options.mode === "gif") {
            this.loadGif(options.arrayBuffer);
        }
        else if (options.mode === "png") {
            this.loadPng(options.arrayBuffer);
        }
    }
    setOnLoadCallback(callback) {
        this.onLoadCallback = callback;
    }
    static getInstance() {
        if (!ImageProcessor.instance) {
            ImageProcessor.instance = new ImageProcessor();
        }
        return ImageProcessor.instance;
    }
    changeMethod(newMethod) {
        this.method = newMethod;
    }
    loadPng(arrayBuffer) {
        this.myPng = this.parsePng();
        const self = this;
        this.myPng.onload = function () {
            if (!self.myPng)
                return;
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
                const ctx = self.canvas.getContext("2d");
                ctx.drawImage(self.myPng.frame.image, 0, 0, imageWidth, imageHeight);
            }
            self.onLoadCallback?.(self._mode);
        };
        this.myPng.loadFromArrayBuffer(arrayBuffer);
    }
    parsePng() {
        const png = {
            onload: null,
            onerror: null,
            loading: true,
            width: 0,
            height: 0,
            frame: null,
            image: null,
            loadFromArrayBuffer: function (arrayBuffer) {
                const img = new Image();
                img.onload = () => {
                    this.width = img.width;
                    this.height = img.height;
                    // Создаем canvas для изображения и устанавливаем его в frame.image
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    const ctx = canvas.getContext("2d");
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
    loadGif(arrayBuffer) {
        this.myGif = this.parseGif();
        const self = this;
        this.myGif.onload = function () {
            if (!self.myGif)
                return;
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
    parseGif() {
        // Весь код функции GIF без изменений, только с добавлением типов
        let st;
        const interlaceOffsets = [0, 4, 2, 1];
        const interlaceSteps = [8, 8, 4, 2];
        let interlacedBufSize = 0;
        let deinterlaceBuf = new Uint8Array(0);
        let pixelBufSize = 0;
        let pixelBuf = new Uint8Array(0);
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
            constructor(data) {
                this.data = new Uint8ClampedArray(data);
                this.pos = 0;
            }
            getString(count) {
                let s = "";
                while (count--) {
                    s += String.fromCharCode(this.data[this.pos++]);
                }
                return s;
            }
            readSubBlocks() {
                let size;
                let count;
                let data = "";
                do {
                    count = size = this.data[this.pos++];
                    while (count--) {
                        data += String.fromCharCode(this.data[this.pos++]);
                    }
                } while (size !== 0 && this.pos < this.data.length);
                return data;
            }
            readSubBlocksB() {
                let size;
                let count;
                const data = [];
                do {
                    count = size = this.data[this.pos++];
                    while (count--) {
                        data.push(this.data[this.pos++]);
                    }
                } while (size !== 0 && this.pos < this.data.length);
                return data;
            }
        }
        function lzwDecode(minSize, data) {
            let i, pixelPos, pos, clear, eod, size, done, dic, code = 0, last, d, len;
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
                    dic[eod] = null;
                }
                else {
                    if (code === eod) {
                        done = true;
                        return;
                    }
                    if (code >= dic.length) {
                        dic.push(dic[last].concat(dic[last][0]));
                    }
                    else if (last !== clear) {
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
        function parseColourTable(count) {
            const colours = [];
            for (let i = 0; i < count; i++) {
                colours.push([st.data[st.pos++], st.data[st.pos++], st.data[st.pos++]]);
            }
            return colours;
        }
        function parse() {
            let bitField;
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
        function parseAppExt() {
            st.pos += 1;
            if ('NETSCAPE' === st.getString(8)) {
                st.pos += 8;
            }
            else {
                st.pos += 3;
                st.readSubBlocks();
            }
        }
        function parseGCExt() {
            let bitField;
            st.pos++;
            bitField = st.data[st.pos++];
            gif.disposalMethod = (bitField & 0b11100) >> 2;
            gif.transparencyGiven = !!(bitField & 0b1);
            gif.delayTime = st.data[st.pos++] + (st.data[st.pos++] << 8);
            gif.transparencyIndex = st.data[st.pos++];
            st.pos++;
        }
        function parseImg() {
            let frame;
            let bitField;
            const deinterlace = function (width) {
                let lines, fromLine, pass, toLine;
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
            frame = {};
            gif.frames.push(frame);
            frame.disposalMethod = gif.disposalMethod;
            frame.time = gif.length;
            frame.delay = gif.delayTime * 10;
            gif.length += frame.delay;
            if (gif.transparencyGiven) {
                frame.transparencyIndex = gif.transparencyIndex;
            }
            else {
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
            }
            else {
                frame.interlaced = false;
            }
            processGifFrame(frame);
        }
        function processGifFrame(frame) {
            const canvas = document.createElement('canvas');
            canvas.width = gif.width;
            canvas.height = gif.height;
            canvas.ctx = canvas.getContext("2d");
            frame.image = canvas;
            const ct = frame.localColourTableFlag ? frame.localColourTable : gif.globalColourTable;
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
                }
                else if (useT) {
                    dat[ind + 3] = 0;
                    ind += 4;
                }
                else {
                    ind += 4;
                }
            }
            frame.image.ctx.putImageData(cData, frame.leftPos, frame.topPos);
            gif.lastFrame = frame;
        }
        function finished() {
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
        function parseExt() {
            const blockID = st.data[st.pos++];
            if (blockID === GIF_FILE.GCExt) {
                parseGCExt();
            }
            else if (blockID === GIF_FILE.COMMENT) {
                gif.comment += st.readSubBlocks();
            }
            else if (blockID === GIF_FILE.APPExt) {
                parseAppExt();
            }
            else {
                if (blockID === GIF_FILE.UNKNOWN) {
                    st.pos += 13;
                }
                st.readSubBlocks();
            }
        }
        function parseBlock() {
            const blockId = st.data[st.pos++];
            if (blockId === GIF_FILE.IMAGE) {
                parseImg();
            }
            else if (blockId === GIF_FILE.EOF) {
                finished();
                return;
            }
            else {
                parseExt();
            }
            setTimeout(parseBlock, 0);
        }
        function error(type) {
            if (typeof gif.onerror === "function") {
                gif.onerror(type);
            }
            gif.loading = false;
        }
        function dataLoaded(data) {
            st = new Stream(data);
            parse();
        }
        function loadFromArrayBuffer(arrayBuffer) {
            dataLoaded(arrayBuffer);
        }
        const gif = {
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
    applyFrameTransforms(frameNumber) {
        let image;
        if (this.mode == "gif") {
            image = this.myGif.frames[frameNumber].image;
        }
        else {
            image = this.myPng.image;
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
    frameRatioCalc() {
        const localCount = parseInt(this.frameCountInput.value, 10);
        const originCount = this.myGif.frames.length;
        this.frameRatio = originCount / localCount;
    }
    originToLocal(originFrame) {
        if (!this.myGif)
            return 0;
        return Math.floor(originFrame / this.frameRatio);
    }
    localToOrigin(local) {
        if (!this.myGif)
            return 0;
        return Math.floor(local * this.frameRatio);
    }
    displayFrame(frameNumber = this.currentOriginFrame) {
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
        }
        else if (this.myPng) {
            this.currentOriginFrame = 0;
            this.currentLocalFrame = 0;
            this.applyFrameTransforms(0);
        }
        else {
            alert('Файл не загружен или содержит ошибки.');
        }
        this.method?.update();
    }
    rotate(angle) {
        angle = this.verticalScale == 1 ? angle : -angle; // так надо
        this.rotationAngle = (this.rotationAngle + angle) % 360;
        // повороты бывают только на 90 так что..
        [this.canvas.width, this.canvas.height] = [this.canvas.height, this.canvas.width]; // поменять пропорции
        [this.canvas.style.width, this.canvas.style.height] = [this.canvas.style.height, this.canvas.style.width];
        [this.widthInput.value, this.heightInput.value] = [this.heightInput.value, this.widthInput.value];
        this.displayFrame();
    }
    mirror() {
        this.verticalScale *= -1;
        this.displayFrame();
    }
    zoomCanvas(zoomed) {
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
    getBitmap(frame) {
        if ((!this.myGif || frame < 0 || frame >= this.myGif.frames.length) && (!this.myPng)) {
            throw new Error("Недопустимый номер кадра");
        }
        if (frame != this.currentOriginFrame) { // перерендер если надо
            this.displayFrame(frame);
        }
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        const bitmap = [];
        // Создаем битмап из данных изображения
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            bitmap.push([r, g, b]);
        }
        return bitmap;
    }
    getFrameBitmap(frame) {
        const bitmap = this.getBitmap(frame);
        return {
            width: this.ctx.canvas.width,
            height: this.ctx.canvas.height,
            bitmap: bitmap
        };
    }
    getGifBitmap() {
        const bitmaps = [];
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
    checkAlert() {
        const widthUserInput = parseInt(this.widthInput.value, 10);
        const framesUserInput = parseInt(this.frameCountInput.value, 10);
        const signals = widthUserInput * 0.25 * 3 * framesUserInput;
        if (signals > 400) {
            this.alertBox.style.display = "block";
        }
        else {
            this.alertBox.style.display = "none";
        }
    }
    ratioCalc(width, height, zoomed = this.zoomed) {
        const ratio = width / height;
        let newWidth;
        let newHeight;
        let max = zoomed ? this.canvasSize : Math.max(width, height);
        max = Math.min(max, this.canvasSize);
        if (ratio > 1) {
            newWidth = max;
            newHeight = Math.round(max / ratio);
        }
        else {
            newWidth = Math.round(max * ratio);
            newHeight = max;
        }
        return [newWidth, newHeight];
    }
    updateCanvasSize(byChanging) {
        let newWidth = parseInt(this.widthInput.value, 10);
        let newHeight = parseInt(this.heightInput.value, 10);
        if (!isNaN(newWidth) && !isNaN(newHeight)) {
            if (this.preserveAspectCheckbox.checked && this.originalAspectRatio) {
                if (byChanging === "width") {
                    newHeight = Math.round(newWidth / this.originalAspectRatio);
                    this.heightInput.value = newHeight.toString();
                }
                else {
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
    updateFrameInput() {
        if (this._mode === "png") {
            this.frameInput.value = '0';
        }
        if (!this.autoPlayCheckbox.checked) {
            const frameNumber = this.localToOrigin(parseInt(this.frameInput.value, 10)) || 0;
            this.displayFrame(frameNumber);
        }
    }
    updateFrameCount() {
        if (!this.myGif)
            return;
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
    getLocalFrameArray() {
        if (!this.myGif)
            return [0];
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
    startAutoPlay() {
        if (!this.myGif)
            return;
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
    updateFrameRate() {
        this.tpf = parseInt(this.frameRateInput.value, 10);
        this.fps = Math.round(60 / this.tpf);
        this.frameRateDisplay.textContent = formatNumber(this.tpf) + " ticks/frame (" + formatNumber(this.fps) + " FPS)";
        if (this.autoPlayCheckbox.checked) {
            this.startAutoPlay();
        }
        function formatNumber(num) {
            const str = num.toString();
            return str.length === 1 ? '_' + str : str;
        }
    }
    toggleAutoPlay() {
        if (this.autoPlayCheckbox.checked) {
            this.startAutoPlay();
        }
        else {
            clearInterval(this.autoPlayInterval);
        }
    }
}
//# sourceMappingURL=imageProcessor.js.map