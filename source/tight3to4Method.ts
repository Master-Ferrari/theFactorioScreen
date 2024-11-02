import { Method, blueprintGetter } from "./method.js";
import CanvasManager, { Mode } from "./imageProcessor.js";
import { factorioEntities as f, Blueprint, CoordinateCursor, Dir, Entities, entitiesAndWires, indexIterator, Wire, Wires } from "./factorioEntities.js";

const canvasManager = CanvasManager.init();
export default class tight3to4Method extends Method {
    readonly name = "tight3to4";
    readonly value = "tight video player";
    readonly supportedModes: Mode[] = ["gif"];

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
        // const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
        // let frameData = canvasManager.getFrameBitmap(currentFrame);
        // let lamps: Entities = [];
        // for (let i = 0; i < frameData.bitmap.length; i++) {
        //     const x = (i % frameData.width) + 0.5;
        //     const y = Math.floor(i / frameData.width) + 0.5;
        //     const [r, g, b] = frameData.bitmap[i];
        //     lamps.push(f.simpleLamp(i + 1, x, y, r, g, b));
        // }
        // let entities: Entities = [];
        // let wires: Wires = [];

        const blueprint = new Blueprint();
        const cc = new CoordinateCursor(0.5, 0.5);
        const ii = new indexIterator(1);

        const bytesShiftBlock = this.makeByteGrid(ii, cc);

        blueprint.addEntitiesAndWires(bytesShiftBlock);

        return blueprint.json();
    }



    makeByteGrid(ii: indexIterator, cc: CoordinateCursor): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];


        let arithmeticGetByte: any = {
            first_signal: {
                type: "virtual",
                name: "signal-each"
            },
            second_constant: 255,
            operation: "AND",
            output_signal: {
                type: "virtual",
                name: "signal-each"
            }
        };

        let arithmeticShiftByte: any = {
            first_signal: {
                type: "virtual",
                name: "signal-each"
            },
            second_constant: 8,
            operation: ">>",
            output_signal: {
                type: "virtual",
                name: "signal-each"
            }
        };

        //building


        block.push(f.arithmeticCombinator(ii.i, cc.x, cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticShiftByte));

        return { entities: block, wires: wires };
    }
}

