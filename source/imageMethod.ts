import { Method, blueprintGetter } from "./method.js";
import ImageProcessor, { Mode } from "./imageProcessor.js";
import {Blueprint, factorioEntities as f} from "./factorioEntities.js";
const canvasManager = ImageProcessor.getInstance();

export default class ImageMethod extends Method {
    readonly name = "image";
    readonly value = "one frame image";
    readonly supportedModes: Mode[] = ["png", "gif"];

    constructor(optionsContainer: HTMLElement, blueprintGetter: blueprintGetter) {
        super(optionsContainer, blueprintGetter);
    }

    init(): void {
        const methodContainer = document.createElement('div');
        methodContainer.style.display = 'flex';
        methodContainer.style.height = '100%';
        methodContainer.style.flexDirection = 'column';
        methodContainer.style.justifyContent = 'flex-end';

        const button = document.createElement('div');
        button.classList.add('control-margin-top-2', 'custom-button');
        button.textContent = "generate blueprint!";

        methodContainer.appendChild(button);

        button.addEventListener('click', () => {
            this.exportJson(this.makeJson());
        });
        while (this.optionsContainer.firstChild) {
            this.optionsContainer.removeChild(this.optionsContainer.firstChild);
        }

        this.optionsContainer.appendChild(methodContainer);
    }

    makeJson(): string {
        
        const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
        let frameData = canvasManager.getFrameBitmap(currentFrame);

        const blueprint = new Blueprint();

        let entities: any[] = [];
        for (let i = 0; i < frameData.bitmap.length; i++) {
            const x = (i % frameData.width) + 0.5;
            const y = Math.floor(i / frameData.width) + 0.5;
            const [r, g, b] = frameData.bitmap[i];
            entities.push(f.simpleLamp(i + 1, x, y, r, g, b));
        }

        blueprint.addEntities(entities);

        return blueprint.json();
    }

    update(): void {}
    destroy(): void {}
}
