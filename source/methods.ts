import CanvasManager, { Mode } from "./imageProcessor.js";
const canvasManager = CanvasManager.init();

import jsonToBlueprint from "./blueprintEncoder.js";
import { DropdownOption } from "./dropdown.js";
import FactorioItems from "./factorioItems.js";


document.getElementById('makePhotoBlueprint')?.addEventListener('click', function () {
});

document.getElementById('makeVideoBlueprint')?.addEventListener('click', function () {

    let framesData = canvasManager.getGifBitmap();

    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
    textOutput.value = JSON.stringify(framesData);
});

document.getElementById('copyButton')?.addEventListener('click', async function () {
    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;
    await navigator.clipboard.writeText(textOutput.value);
});



// Blueprints





class MethodsManager {
    private methods: Method[] = [];

    add(methods: Method[]) {
        methods.forEach((method) => {
            this.methods.push(method);
        })
    }

    getList(mode: Mode): DropdownOption[] {
        return this.methods.map((method) => {
            return {
                name: method.name,
                value: method.value,
                isActive: method.supportedModes.includes(mode)
            }
        })
    }
}


abstract class Method {
    abstract readonly name: string;
    abstract readonly value: string;
    readonly optionsContainer: HTMLElement;
    abstract readonly supportedModes: Mode[];

    constructor(optionsContainer: HTMLElement) {
        this.optionsContainer = optionsContainer; // Инициализируем optionsContainer в базовом классе
        this.init(); // Вызываем init после инициализации optionsContainer
    }

    // Абстрактные методы, которые должны быть реализованы в каждом наследуемом классе
    abstract init(): void;
    abstract makeJson(): string;
}



class ImageMethod extends Method {
    readonly name = "image";
    readonly value = "one frame image";
    readonly supportedModes: Mode[] = ["png"];

    private internalVariable: any;

    constructor(optionsContainer: HTMLElement) {
        console.log("test2", optionsContainer);
        super(optionsContainer);
        console.log("test3", optionsContainer);
    }

    init(): void {
        const button = document.createElement('button');
        button.textContent = "Click me";

        button.addEventListener('click', () => {
            this.internalVariable = "Updated by click";
            console.log("Button clicked, internalVariable updated:", this.internalVariable);
        });

        this.optionsContainer.appendChild(button);
    }

    makeJson(): string {

        const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
        let frameData = canvasManager.getFrameBitmap(currentFrame);
        let lamps: any[] = [];
        for (let i = 0; i < frameData.bitmap.length; i++) {
            const x = (i % frameData.width) + 0.5;
            const y = Math.floor(i / frameData.width) + 0.5;
            const [r, g, b] = frameData.bitmap[i];
            lamps.push(FactorioItems.simpleLamp(i + 1, x, y, r, g, b));
        }
        let outputData = FactorioItems.blueprintTitle(lamps);
        const json = jsonToBlueprint(JSON.stringify(outputData));

        return json;
    }
}

export default function getMethods(optionsContainer: HTMLElement): MethodsManager {
    const methods = new MethodsManager;
    methods.add([
        (new ImageMethod(optionsContainer))
    ]);
    return methods;
}