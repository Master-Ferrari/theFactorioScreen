import { Method } from "./method.js";
import CanvasManager from "./imageProcessor.js";
import { Blueprint, factorioEntities as f } from "./factorioEntities.js";
const canvasManager = CanvasManager.init();
export default class ImageMethod extends Method {
    constructor(optionsContainer, blueprintGetter) {
        super(optionsContainer, blueprintGetter);
        this.name = "image";
        this.value = "one frame image";
        this.supportedModes = ["png", "gif"];
    }
    init() {
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
    makeJson() {
        const currentFrame = parseInt(document.getElementById('frameInput').value, 10);
        let frameData = canvasManager.getFrameBitmap(currentFrame);
        const blueprint = new Blueprint();
        let entities = [];
        for (let i = 0; i < frameData.bitmap.length; i++) {
            const x = (i % frameData.width) + 0.5;
            const y = Math.floor(i / frameData.width) + 0.5;
            const [r, g, b] = frameData.bitmap[i];
            entities.push(f.simpleLamp(i + 1, x, y, r, g, b));
        }
        blueprint.addEntities(entities);
        return blueprint.json();
    }
}
//# sourceMappingURL=imageMethod.js.map