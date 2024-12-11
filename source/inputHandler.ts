import { AlertManager } from "./alertManager.js";
import jsonToBlueprint from "./blueprintEncoder.js";
import { DropdownOption, Dropdown } from "./dropdown.js";
import ImageProcessor, { Mode } from "./imageProcessor.js";
import { Method } from "./method.js";
import getMethods from "./methodsManager.js";
import tight3to4Method from "./tight3to4Method.js";

// Обработчики событий
const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const fileNameLabel = document.getElementById("fileNameLabel") as HTMLInputElement;
const frameInput = document.getElementById("frameInput") as HTMLInputElement;
const frameLabel = document.getElementById("frameLabel") as HTMLInputElement;
const widthInput = document.getElementById("widthInput") as HTMLInputElement;
const heightInput = document.getElementById("heightInput") as HTMLInputElement;
const frameCountInput = document.getElementById("frameCountInput") as HTMLInputElement;
const frameCountLabel = document.getElementById("frameCountLabel") as HTMLInputElement;
const autoPlayContainer = document.getElementById("autoPlayContainer") as HTMLInputElement;
const autoPlayCheckbox = document.getElementById("autoPlayCheckbox") as HTMLInputElement;
const autoPlayLabel = document.getElementById("autoPlayLabel") as HTMLInputElement;
const frameRateInput = document.getElementById("frameRateInput") as HTMLInputElement;
const frameRateContainer = document.getElementById("frameRateContainer") as HTMLInputElement;
const frameRateLabel = document.getElementById("frameRateLabel") as HTMLInputElement;
const frameRateDisplay = document.getElementById("frameRateDisplay") as HTMLElement;
const preserveAspectCheckbox = document.getElementById("preserveAspectCheckbox") as HTMLInputElement;
const mirrorCanvasButton = document.getElementById("mirrorCanvas") as HTMLButtonElement;
const rotateClockwiseButton = document.getElementById('rotateClockwise') as HTMLButtonElement;
const rotateCounterClockwiseButton = document.getElementById('rotateCounterClockwise') as HTMLButtonElement;
const scaleCanvasButton = document.getElementById("scaleCanvas") as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const methodSelect = document.getElementById('methodSelect') as HTMLButtonElement;


const testButton = document.getElementById('testButton') as HTMLButtonElement;


const scalePlusSVG = document.getElementById('scalePlusSVG') as HTMLButtonElement;
const scaleMinusSVG = document.getElementById('scaleMinusSVG') as HTMLButtonElement;

// const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;


export default class InputHandler {
    private canvasManager: ImageProcessor;

    private static instance: InputHandler;

    private alertManager: AlertManager = AlertManager.getInstance();

    static getInstance() {
        if (!this.instance) {
            this.instance = new InputHandler();
        }
        return this.instance;
    }

    private constructor() {

        //#region callbacks


        const self = this;

        const mainControls = document.getElementById('mainControls') as HTMLButtonElement;
        const canvasControls = document.getElementById('canvasControls') as HTMLButtonElement;
        const copyButton = document.getElementById('copyButton') as HTMLButtonElement;

        const methodSelect = document.getElementById('methodSelect') as HTMLElement;
        const textOutput = document.getElementById('textOutput') as HTMLElement;
        const blueprintOptions = document.getElementById('blueprintOptions') as HTMLButtonElement;

        function onBlueprint(text: string) {
            textOutput.innerText = text;
        }

        const methods = getMethods(blueprintOptions, onBlueprint);
        let currentMethod: Method | null = null;

        const onMethodSelect = (index: number | null) => {
            currentMethod?.destroy();
            if (index === null) { return; }
            currentMethod = methods.getById(index);
            if (currentMethod === null) { return; }

            currentMethod.init();
            this.canvasManager?.changeMethod(currentMethod);
        }

        const modeDropdown = new Dropdown({
            dropdownElement: methodSelect,
            optionsList: methods.getList(null),
            onSelectCallback: onMethodSelect,
            defaultText: "method select",
            selectedPrefix: "selected method: "
        });

        function baseControlsVisability(hide: boolean = false) {
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
        };

        this.canvasManager.setOnLoadCallback(onLoad);




        //#endregion



        //#region Afqkgbrth
        fileInput.addEventListener('change', function (event: Event) {
            const target = event.target as HTMLInputElement;
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
            let mode: Mode = null;
            if (isSingleGif) {
                mode = 'gif';
            } else if (multiplePngs) {
                mode = 'pngSequence';
            } else if (isSinglePng) {
                mode = 'png';
            }

            if (!mode) {
                self.alertManager.setAlert("fileError", true);
                return;
            }

            methodSelect.classList.remove('hidden');

            self.alertManager.setAlert("fileError", false);

            // Обновляем метку с именем выбранного файла(ов)
            if (files.length === 1) {
                fileNameLabel.textContent = "selected: " + self.shortLabel(files[0].name, 10);
            } else {
                fileNameLabel.textContent = `selected: ${files.length} files`;
            }

            modeDropdown.selectByName(null); // сброс метода

            const fileInputs = [ // гуи для гифок
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
                fileInputs.forEach(element => element.classList.remove('hidden'));
                // Чтение одного GIF-файла
                readFileAsArrayBuffer(files[0]).then(arrayBuffer => {
                    self.canvasManager.loader({ mode, arrayBuffer });
                }).catch(error => {
                    console.error('Ошибка при чтении файла', error);
                });

            } else if (mode === 'pngSequence') {
                // Преобразование FileList в массив и сортировка по имени
                const sortedFilesArray = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));

                // Функция для создания объекта FileList
                function createFileList(filesArray: File[]): FileList {
                    const dataTransfer = new DataTransfer();
                    filesArray.forEach(file => dataTransfer.items.add(file));
                    return dataTransfer.files;
                }

                // Конвертируем массив обратно в FileList
                const sortedFileList = createFileList(sortedFilesArray);

                // Чтение нескольких PNG-файлов из отсортированного списка
                readFilesAsArrayBuffers(sortedFileList).then(arrayBuffers => {
                    self.canvasManager.loader({ mode, arrayBuffers });
                }).catch(error => {
                    console.error('Ошибка при чтении файлов', error);
                });


            } else if (mode === 'png') {
                fileInputs.forEach(element => element.classList.add('hidden'));
                // Чтение одного PNG-файла
                readFileAsArrayBuffer(files[0]).then(arrayBuffer => {
                    self.canvasManager.loader({ mode, arrayBuffer });
                }).catch(error => {
                    console.error('Ошибка при чтении файла', error);
                });
            }

            function readFilesAsArrayBuffers(files: FileList): Promise<ArrayBuffer[]> {
                return Promise.all(Array.from(files).map(file => readFileAsArrayBuffer(file)));
            }

            // Функции для чтения файлов
            function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = function (e: ProgressEvent<FileReader>) {
                        const arrayBuffer = e.target?.result as ArrayBuffer;
                        resolve(arrayBuffer);
                    };
                    reader.onerror = function (e) {
                        reject(e);
                    };
                    reader.readAsArrayBuffer(file);
                });
            }


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
            if (!textOutput || textOutput.value == "") {
                copyButton.innerText = "it is nothing to copy...";
            } else {
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

    private shortLabel(text: string, max: number) {
        if (text.length <= max) {
            return text;
        }

        const start = text.slice(0, max - 1); // первые max - 1 символов
        const end = text.slice(- (max - 2)); // последние max - 2 символов
        return `${start}...${end}`; // соединяем с троеточием
    }
}


