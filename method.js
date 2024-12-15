import jsonToBlueprint from "./blueprintEncoder.js";
export class Method {
    constructor(optionsContainer, blueprintGetter) {
        this.optionsContainer = optionsContainer;
        this.blueprintGetter = blueprintGetter;
    }
    exportJson(json) {
        this.blueprintGetter(jsonToBlueprint(json));
        // this.blueprintGetter(json);
    }
}
