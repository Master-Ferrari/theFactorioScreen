import { Mode } from "./imageProcessor.js";

import jsonToBlueprint from "./blueprintEncoder.js";

export type blueprintGetter = (json: any) => void;
export type updateOptions = {frameCount: number, currentFrame: number, mode: Mode};

export abstract class Method {
    abstract readonly name: string;
    abstract readonly value: string;
    readonly optionsContainer: HTMLElement;
    abstract readonly supportedModes: Mode[];
    readonly blueprintGetter: blueprintGetter;

    constructor(optionsContainer: HTMLElement, blueprintGetter: blueprintGetter) {
        this.optionsContainer = optionsContainer;
        this.blueprintGetter = blueprintGetter;
    }

    abstract init(): void;

    abstract makeJson(): string;

    abstract update(options: updateOptions): void;

    abstract destroy(): void;

    protected exportJson(json: string) {
        this.blueprintGetter(jsonToBlueprint(json));
        // this.blueprintGetter(json);
    }
}