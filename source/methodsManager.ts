import { DropdownOption } from "./dropdown.js";
import { Mode } from "./imageProcessor.js";
import { Method, blueprintGetter } from "./method.js";


export class MethodsManager {
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

    getById(id: number): Method | null {
        return this.methods[id];
    }
}

import ImageMethod from "./imageMethod.js";
import tight3to4Method from "./tight3to4Method.js";

export default function getMethods(optionsContainer: HTMLElement, blueprintGetter: blueprintGetter): MethodsManager {
    const methods = new MethodsManager;
    methods.add([
        new ImageMethod(optionsContainer, blueprintGetter),
        new tight3to4Method(optionsContainer, blueprintGetter),
    ]);
    return methods;
}

