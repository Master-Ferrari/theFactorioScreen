import CanvasManager from "./imageProcessor.js";
const canvasManager = CanvasManager.init();
import jsonToBlueprint from "./blueprintEncoder.js";
import FactorioItems from "./factorioItems.js";
class MethodsManager {
    constructor() {
        this.methods = [];
    }
    add(methods) {
        methods.forEach((method) => {
            this.methods.push(method);
        });
    }
    getList(mode) {
        return this.methods.map((method) => {
            return {
                name: method.name,
                value: method.value,
                isActive: method.supportedModes.includes(mode)
            };
        });
    }
    getById(id) {
        return this.methods[id];
    }
}
class Method {
    constructor(optionsContainer, blueprintGetter) {
        this.optionsContainer = optionsContainer;
        this.blueprintGetter = blueprintGetter;
    }
    exportJson(json) {
        this.blueprintGetter(jsonToBlueprint(json));
    }
}
class ImageMethod extends Method {
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
        let lamps = [];
        for (let i = 0; i < frameData.bitmap.length; i++) {
            const x = (i % frameData.width) + 0.5;
            const y = Math.floor(i / frameData.width) + 0.5;
            const [r, g, b] = frameData.bitmap[i];
            lamps.push(FactorioItems.simpleLamp(i + 1, x, y, r, g, b));
        }
        let outputData = FactorioItems.blueprintTitle(lamps);
        const json = JSON.stringify(outputData);
        return json;
    }
}
export default function getMethods(optionsContainer, blueprintGetter) {
    const methods = new MethodsManager;
    methods.add([
        new ImageMethod(optionsContainer, blueprintGetter),
    ]);
    return methods;
}
//# sourceMappingURL=methods.js.map