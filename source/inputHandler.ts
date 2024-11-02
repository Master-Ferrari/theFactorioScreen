import jsonToBlueprint from "./blueprintEncoder.js";
import { DropdownOption, Dropdown } from "./dropdown.js";
import CanvasManager from "./imageProcessor.js";
import tight3to4Method from "./tight3to4Method.js";

// Обработчики событий
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const fileNameLabel = document.getElementById("fileNameLabel") as HTMLInputElement;
const frameInput = document.getElementById("frameInput") as HTMLInputElement;
const widthInput = document.getElementById("widthInput") as HTMLInputElement;
const heightInput = document.getElementById("heightInput") as HTMLInputElement;
const frameCountInput = document.getElementById("frameCountInput") as HTMLInputElement;
const autoPlayCheckbox = document.getElementById("autoPlayCheckbox") as HTMLInputElement;
const frameRateInput = document.getElementById("frameRateInput") as HTMLInputElement;
const frameRateDisplay = document.getElementById("frameRateDisplay") as HTMLElement;
const preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox") as HTMLInputElement;
const mirrorCanvasButton = document.getElementById("mirrorCanvas") as HTMLButtonElement;
const rotateClockwiseButton = document.getElementById('rotateClockwise') as HTMLButtonElement;
const rotateCounterClockwiseButton = document.getElementById('rotateCounterClockwise') as HTMLButtonElement;
const scaleCanvasButton = document.getElementById("scaleCanvas") as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;

const testButton = document.getElementById('testButton') as HTMLButtonElement;


const scalePlusSVG = document.getElementById('scalePlusSVG') as HTMLButtonElement;
const scaleMinusSVG = document.getElementById('scaleMinusSVG') as HTMLButtonElement;

// const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;


export default class InputHandler {
    private canvasManager: CanvasManager;
    constructor(canvasManager: CanvasManager) {
        this.canvasManager = canvasManager;
    }

    addEventListeners() {
        const self = this;
        // Обработчик выбора файла
        fileInput.addEventListener('change', function (event: Event) {
            const target = event.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                alert('Пожалуйста, выберите файл.');
                return;
            }

            fileNameLabel.textContent = "selected: " + self.shortLabel(file.name, 10);

            // Определяем режим (gif или png) и проверяем тип файла
            const mode = file.type === 'image/gif' ? 'gif' : file.type === 'image/png' ? 'png' : null;

            if (!mode) {
                alert('Пожалуйста, выберите файл GIF или PNG.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e: ProgressEvent<FileReader>) {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                self.canvasManager.loader({ mode, arrayBuffer });
            };
            reader.readAsArrayBuffer(file);
        });

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
        function cropIcon(crop: boolean) {
            if (crop) {
                scalePlusSVG.style.display = 'none';
                scaleMinusSVG.style.display = 'block';
            } else {
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
            const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
            await navigator.clipboard.writeText(textOutput.value);
            copyButton.innerText = "Copied!";
            setTimeout(() => {
                copyButton.innerText = "Copy to clipboard";
            }, 1000);
        });


        testButton.addEventListener('click', async function () {


            const textOutput = (() => {
                const blueprintOptions = document.getElementById('blueprintOptions') as HTMLButtonElement;
                function onBlueprint(text: string) {
                }
                const method = new tight3to4Method(blueprintOptions, onBlueprint);
                method.init();
                const json = method.makeJson();
                return jsonToBlueprint(json);
            })();

            await navigator.clipboard.writeText(textOutput);
            testButton.innerText = "Copied!";
            setTimeout(() => {
                testButton.innerText = "test";
            }, 1000);
        });

        // Обработчик чекбокса автопроигрывания
        autoPlayCheckbox.addEventListener('change', function () {
            self.canvasManager.toggleAutoPlay();
        });

        // Обработчик изменения FPS
        frameRateInput.addEventListener('input', function () {
            self.canvasManager.updateFrameRate();
        });
        // Декодер и проигрыватель GIF для использования с Canvas API

    }

    private shortLabel(text: string, max: number) {
        if (text.length <= max) {
            return text;
        }

        const start = text.slice(0, max - 1); // первые max - 1 символов
        const end = text.slice(- (max - 2)); // последние max - 2 символов
        return `${start}...${end}`; // соединяем с троеточием
    }
}


