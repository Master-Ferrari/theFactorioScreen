import CanvasManager from "./gifDecoder.js";

// Обработчики событий
const gifInput = document.getElementById("gifInput") as HTMLInputElement;
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


const mainControls = document.getElementById('mainControls') as HTMLButtonElement;
const canvasControls = document.getElementById('canvasControls') as HTMLButtonElement;
const makeVideoBlueprint = document.getElementById('makeVideoBlueprint') as HTMLButtonElement;
const makePhotoBlueprint = document.getElementById('makePhotoBlueprint') as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;


const scalePlusSVG = document.getElementById('scalePlusSVG') as HTMLButtonElement;
const scaleMinusSVG = document.getElementById('scaleMinusSVG') as HTMLButtonElement;

function hide(hide: boolean = false) {
    if (hide) {
        mainControls.style.display = 'none';
        canvasControls.style.display = 'none';
        makeVideoBlueprint.classList.add('hidden');
        makePhotoBlueprint.classList.add('hidden');
        copyButton.classList.add('hidden');
    }
    else {
        mainControls.style.display = 'grid';
        canvasControls.style.display = 'flex';
        makeVideoBlueprint.classList.remove('hidden');
        makePhotoBlueprint.classList.remove('hidden');
        copyButton.classList.remove('hidden');
    }
}

const canvasManager = CanvasManager.getInstance();
// CanvasManager.dsfsdfedfs();

// Обработчик выбора файла
gifInput.addEventListener('change', function (event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && file.type === 'image/gif') {
        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            canvasManager.loadGif(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
        hide();
    } else {
        alert('Пожалуйста, выберите файл GIF.');
    }
});

// Кнопка зеркального отображения
mirrorCanvasButton.addEventListener('click', function () {
    canvasManager.mirror();
});

// Кнопки поворота
rotateClockwiseButton.addEventListener('click', function () {
    canvasManager.rotate(90);
});

rotateCounterClockwiseButton.addEventListener('click', function () {
    canvasManager.rotate(-90);
});

// Кнопка масштабирования канваса
function cropIcon(crop: boolean){
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
    canvasManager.scaleCanvas();
});

// Обработчик изменения ширины
widthInput.addEventListener('input', function () {
    canvasManager.updateWidth();
});

// Обработчик изменения высоты
heightInput.addEventListener('input', function () {
    canvasManager.updateHeight();
});

// Обработчик изменения текущего кадра
frameInput.addEventListener('input', function () {
    canvasManager.updateFrameInput();
});

// Обработчик изменения количества кадров
frameCountInput.addEventListener('change', function () {
    canvasManager.updateFrameCount();
});

// Обработчик чекбокса автопроигрывания
autoPlayCheckbox.addEventListener('change', function () {
    canvasManager.toggleAutoPlay();
});

// Обработчик изменения FPS
frameRateInput.addEventListener('input', function () {
    canvasManager.updateFrameRate();
});
// Декодер и проигрыватель GIF для использования с Canvas API
