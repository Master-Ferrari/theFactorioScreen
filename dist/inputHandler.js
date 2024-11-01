// Обработчики событий
const fileInput = document.getElementById("fileInput");
const fileNameLabel = document.getElementById("fileNameLabel");
const frameInput = document.getElementById("frameInput");
const widthInput = document.getElementById("widthInput");
const heightInput = document.getElementById("heightInput");
const frameCountInput = document.getElementById("frameCountInput");
const autoPlayCheckbox = document.getElementById("autoPlayCheckbox");
const frameRateInput = document.getElementById("frameRateInput");
const frameRateDisplay = document.getElementById("frameRateDisplay");
const preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox");
const mirrorCanvasButton = document.getElementById("mirrorCanvas");
const rotateClockwiseButton = document.getElementById('rotateClockwise');
const rotateCounterClockwiseButton = document.getElementById('rotateCounterClockwise');
const scaleCanvasButton = document.getElementById("scaleCanvas");
const copyButton = document.getElementById('copyButton');
const scalePlusSVG = document.getElementById('scalePlusSVG');
const scaleMinusSVG = document.getElementById('scaleMinusSVG');
// const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
export default class InputHandler {
    constructor(canvasManager) {
        this.canvasManager = canvasManager;
    }
    addEventListeners() {
        const self = this;
        // Обработчик выбора файла
        fileInput.addEventListener('change', function (event) {
            const target = event.target;
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
            reader.onload = function (e) {
                const arrayBuffer = e.target?.result;
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
            await navigator.clipboard.writeText(textOutput.value);
            copyButton.innerText = "Copied!";
            setTimeout(() => {
                copyButton.innerText = "Copy to clipboard";
            }, 500);
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
    shortLabel(text, max) {
        if (text.length <= max) {
            return text;
        }
        const start = text.slice(0, max - 1); // первые max - 1 символов
        const end = text.slice(-(max - 2)); // последние max - 2 символов
        return `${start}...${end}`; // соединяем с троеточием
    }
}
//# sourceMappingURL=inputHandler.js.map