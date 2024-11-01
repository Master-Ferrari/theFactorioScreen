import CanvasManager, { Mode } from "./imageProcessor.js";
const canvasManager = CanvasManager.init();

import jsonToBlueprint from "./blueprintEncoder.js";
import { DropdownOption } from "./dropdown.js";


document.getElementById('makePhotoBlueprint')?.addEventListener('click', function () {
    const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
    let frameData = canvasManager.getFrameBitmap(currentFrame);



    let lamps: any[] = [];
    for (let i = 0; i < frameData.bitmap.length; i++) {
        const x = (i % frameData.width) + 0.5;
        const y = Math.floor(i / frameData.width) + 0.5;
        const [r, g, b] = frameData.bitmap[i];
        lamps.push(simpleLamp(i + 1, x, y, r, g, b));
    }

    let outputData = blueprintTitle(lamps);

    const textOutput = document.getElementById('textOutput') as HTMLTextAreaElement;

    console.log("lamps", lamps);

    textOutput.value = jsonToBlueprint(JSON.stringify(outputData));
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


function blueprintTitle(entities: any[]): any {
    return {
        blueprint: {
            icons: [
                {
                    signal: {
                        name: "small-lamp"
                    },
                    index: 1
                }
            ],
            entities: entities,
            item: "blueprint",
            version: 562949954076673
        }
    };
}

function simpleLamp(index: number, x: number, y: number, r: number, g: number, b: number): any {
    return {
        entity_number: index,
        name: "small-lamp",
        position: {
            x: x,
            y: y
        },
        color: {
            r: r / 255,
            g: g / 255,
            b: b / 255,
            a: 1
        },
        always_on: true
    };
}



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
    abstract readonly optionsContainer: HTMLElement;
    abstract readonly supportedModes: Mode[];

    // Абстрактные методы, которые должны быть реализованы в каждом наследуемом классе
    abstract init(): void;
    abstract makeJson(): string;

    constructor() {
        this.init(); // Автоматический вызов при создании экземпляра
    }
}


class ImageMethod extends Method {
    readonly name = "image";
    readonly value = "one frame image";
    readonly optionsContainer: HTMLElement;
    readonly supportedModes: Mode[] = ["png"];

    private internalVariable: any;

    constructor(optionsContainer: HTMLElement) {
        super();
        this.optionsContainer = optionsContainer;
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
        return JSON.stringify({ data: this.internalVariable });
    }
}

export default function getMethods(optionsContainer: HTMLElement): MethodsManager {
    const methods = new MethodsManager;
    methods.add([
        (new ImageMethod(optionsContainer))
    ]);
    return methods;
}