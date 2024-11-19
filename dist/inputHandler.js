import { AlertManager } from "./alertManager.js";
import { Dropdown } from "./dropdown.js";
import ImageProcessor from "./imageProcessor.js";
import getMethods from "./methodsManager.js";
// Обработчики событий
const fileInput = document.getElementById("fileInput");
const fileNameLabel = document.getElementById("fileNameLabel");
const frameInput = document.getElementById("frameInput");
const frameLabel = document.getElementById("frameLabel");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const frameCountInput = document.getElementById("frameCountInput");
const frameCountLabel = document.getElementById("frameCountLabel");
const autoPlayContainer = document.getElementById("autoPlayContainer");
const autoPlayCheckbox = document.getElementById("autoPlayCheckbox");
const autoPlayLabel = document.getElementById("autoPlayLabel");
const frameRateInput = document.getElementById("frameRateInput");
const frameRateContainer = document.getElementById("frameRateContainer");
const frameRateLabel = document.getElementById("frameRateLabel");
const frameRateDisplay = document.getElementById("frameRateDisplay");
const preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox");
const mirrorCanvasButton = document.getElementById("mirrorCanvas");
const rotateClockwiseButton = document.getElementById('rotateClockwise');
const rotateCounterClockwiseButton = document.getElementById('rotateCounterClockwise');
const scaleCanvasButton = document.getElementById("scaleCanvas");
const copyButton = document.getElementById('copyButton');
const methodSelect = document.getElementById('methodSelect');
const testButton = document.getElementById('testButton');
const scalePlusSVG = document.getElementById('scalePlusSVG');
const scaleMinusSVG = document.getElementById('scaleMinusSVG');
// const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
export default class InputHandler {
    static getInstance() {
        if (!this.instance) {
            this.instance = new InputHandler();
        }
        return this.instance;
    }
    constructor() {
        //#region callbacks
        this.alertManager = AlertManager.getInstance();
        const self = this;
        const mainControls = document.getElementById('mainControls');
        const canvasControls = document.getElementById('canvasControls');
        const copyButton = document.getElementById('copyButton');
        const methodSelect = document.getElementById('methodSelect');
        const textOutput = document.getElementById('textOutput');
        const blueprintOptions = document.getElementById('blueprintOptions');
        function onBlueprint(text) {
            textOutput.innerText = text;
        }
        const methods = getMethods(blueprintOptions, onBlueprint);
        let currentMethod = null;
        const onMethodSelect = (index) => {
            currentMethod?.destroy();
            if (index === null) {
                return;
            }
            currentMethod = methods.getById(index);
            if (currentMethod === null) {
                return;
            }
            currentMethod.init();
            this.canvasManager?.changeMethod(currentMethod);
        };
        const modeDropdown = new Dropdown({
            dropdownElement: methodSelect,
            optionsList: methods.getList(null),
            onSelectCallback: onMethodSelect,
            defaultText: "method select",
            selectedPrefix: "selected method: "
        });
        function baseControlsVisability(hide = false) {
            if (hide) {
                mainControls.style.display = 'none';
                canvasControls.style.display = 'none';
                copyButton.classList.add('hidden');
            }
            else {
                mainControls.style.display = 'grid';
                canvasControls.style.display = 'flex';
                copyButton.classList.remove('hidden');
            }
        }
        this.canvasManager = ImageProcessor.getInstance();
        function onLoad() {
            modeDropdown.updateOptions(methods.getList(self.canvasManager.mode));
            baseControlsVisability(false);
        }
        ;
        this.canvasManager.setOnLoadCallback(onLoad);
        //#endregion
        //#region Afqkgbrth
        fileInput.addEventListener('change', function (event) {
            const target = event.target;
            const files = target.files;
            // Проверяем, выбраны ли файлы
            if (!files || files.length === 0) {
                self.alertManager.setAlert("fileError", true);
                return;
            }
            // Определяем типы файлов
            const fileTypes = Array.from(files).map(file => file.type);
            const isSingleGif = files.length === 1 && fileTypes[0] === 'image/gif';
            const isSinglePng = files.length === 1 && fileTypes[0] === 'image/png';
            const multiplePngs = files.length > 1 && fileTypes.every(type => type === 'image/png');
            // Определяем режим на основе выбранных файлов
            let mode = null;
            if (isSingleGif) {
                mode = 'gif';
            }
            else if (multiplePngs) {
                mode = 'pngSequence';
            }
            else if (isSinglePng) {
                mode = 'png';
            }
            if (!mode) {
                self.alertManager.setAlert("fileError", true);
                return;
            }
            self.alertManager.setAlert("fileError", false);
            // Обновляем метку с именем выбранного файла(ов)
            if (files.length === 1) {
                fileNameLabel.textContent = "selected: " + self.shortLabel(files[0].name, 10);
            }
            else {
                fileNameLabel.textContent = `selected: ${files.length} files`;
            }
            modeDropdown.selectByName(null); // сброс метода
            const gifInputs = [
                frameCountInput,
                frameCountLabel,
                frameInput,
                frameLabel,
                frameRateContainer,
                frameRateLabel,
                autoPlayContainer,
                autoPlayLabel,
            ];
            if (mode === 'gif') {
                gifInputs.forEach(element => element.classList.remove('hidden'));
                // Чтение одного GIF-файла
                readFileAsArrayBuffer(files[0]).then(arrayBuffer => {
                    self.canvasManager.loader({ mode, arrayBuffer });
                }).catch(error => {
                    console.error('Ошибка при чтении файла', error);
                });
            }
            else if (mode === 'pngSequence') {
                // Чтение нескольких PNG-файлов
                readFilesAsArrayBuffers(files).then(arrayBuffers => {
                    self.canvasManager.loader({ mode, arrayBuffers });
                }).catch(error => {
                    console.error('Ошибка при чтении файлов', error);
                });
            }
            else if (mode === 'png') {
                gifInputs.forEach(element => element.classList.add('hidden'));
                // Чтение одного PNG-файла
                readFileAsArrayBuffer(files[0]).then(arrayBuffer => {
                    self.canvasManager.loader({ mode, arrayBuffer });
                }).catch(error => {
                    console.error('Ошибка при чтении файла', error);
                });
            }
            // Функции для чтения файлов
            function readFileAsArrayBuffer(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const arrayBuffer = e.target?.result;
                        resolve(arrayBuffer);
                    };
                    reader.onerror = function (e) {
                        reject(e);
                    };
                    reader.readAsArrayBuffer(file);
                });
            }
            function readFilesAsArrayBuffers(files) {
                return Promise.all(Array.from(files).map(file => readFileAsArrayBuffer(file)));
            }
            // methodSelect.classList.remove('hidden');
            // const reader = new FileReader();
            // reader.onload = function (e: ProgressEvent<FileReader>) {
            //     const arrayBuffer = e.target?.result as ArrayBuffer;
            //     self.canvasManager.loader({ mode, arrayBuffer });
            // };
            // reader.readAsArrayBuffer(file);
            // const gifInputs = [
            //     frameCountInput,
            //     frameCountLabel,
            //     frameInput,
            //     frameLabel,
            //     frameRateContainer,
            //     frameRateLabel,
            //     autoPlayContainer,
            //     autoPlayLabel,
            // ];
        });
        //#endregion
        //#region кнопачки
        // Кнопка зеркального отображения
        mirrorCanvasButton.addEventListener('click', function () {
            self.canvasManager.mirror();
        });
        // Кнопки поворота
        rotateClockwiseButton.addEventListener('click', function () {
            self.canvasManager.rotate(90);
        });
        rotateCounterClockwiseButton.addEventListener('click', function () {
            self.canvasManager.rotate(-90);
        });
        // Кнопка масштабирования канваса
        function cropIcon(crop) {
            if (crop) {
                scalePlusSVG.style.display = 'none';
                scaleMinusSVG.style.display = 'block';
            }
            else {
                scalePlusSVG.style.display = 'block';
                scaleMinusSVG.style.display = 'none';
            }
        }
        let cropped = false;
        scaleCanvasButton.addEventListener('click', function () {
            cropped = !cropped;
            cropIcon(cropped);
            self.canvasManager.zoomCanvas(cropped);
        });
        // Обработчик изменения ширины
        widthInput.addEventListener('input', function () {
            self.canvasManager.updateCanvasSize("width");
        });
        // Обработчик изменения высоты
        heightInput.addEventListener('input', function () {
            self.canvasManager.updateCanvasSize("height");
        });
        // Обработчик изменения текущего кадра
        frameInput.addEventListener('input', function () {
            self.canvasManager.updateFrameInput();
        });
        // Обработчик изменения количества кадров
        frameCountInput.addEventListener('change', function () {
            self.canvasManager.updateFrameCount();
        });
        copyButton.addEventListener('click', async function () {
            const textOutput = document.getElementById('textOutput');
            if (!textOutput || textOutput.value == "") {
                copyButton.innerText = "it is nothing to copy...";
            }
            else {
                await navigator.clipboard.writeText(textOutput.value);
                copyButton.innerText = "copied!";
            }
            setTimeout(() => {
                copyButton.innerText = "copy to clipboard";
            }, 1000);
        });
        // testButton?.addEventListener('click', async function () {
        //     const textOutput = (() => {
        //         const blueprintOptions = document.getElementById('blueprintOptions') as HTMLButtonElement;
        //         function onBlueprint(text: string) {
        //         }
        //         const method = new tight3to4Method(blueprintOptions, onBlueprint);
        //         method.init();
        //         const json = method.makeJson();
        //         return jsonToBlueprint(json);
        //     })();
        //     await navigator.clipboard.writeText(textOutput);
        //     testButton.innerText = "copied!";
        //     setTimeout(() => {
        //         testButton.innerText = "test";
        //     }, 1000);
        // });
        // Обработчик чекбокса автопроигрывания
        autoPlayCheckbox.addEventListener('change', function () {
            self.canvasManager.toggleAutoPlay();
        });
        // Обработчик изменения FPS
        frameRateInput.addEventListener('input', function () {
            self.canvasManager.updateFrameRate();
        });
        // Декодер и проигрыватель GIF для использования с Canvas API
        //#endregion
    }
    shortLabel(text, max) {
        if (text.length <= max) {
            return text;
        }
        const start = text.slice(0, max - 1); // первые max - 1 символов
        const end = text.slice(-(max - 2)); // последние max - 2 символов
        return `${start}...${end}`; // соединяем с троеточием
    }
}
