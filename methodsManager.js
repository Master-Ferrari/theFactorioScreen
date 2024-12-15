export class MethodsManager {
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
import ImageMethod from "./imageMethod.js";
import tight3to4Method from "./tight3to4Method.js";
export default function getMethods(optionsContainer, blueprintGetter) {
    const methods = new MethodsManager;
    methods.add([
        new ImageMethod(optionsContainer, blueprintGetter),
        new tight3to4Method(optionsContainer, blueprintGetter),
    ]);
    return methods;
}
