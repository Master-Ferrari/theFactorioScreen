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
        const cc = new CoordinateCursor(0, 0);
        const ii = new indexIterator(1);

        const makeFramesBlock = this.makeFrames(ii, cc, 4);
        cc.dx(3);
        ii.shift(1);
        const bytesShiftBlock = this.makeByteGrid(ii, cc);

        blueprint.addEntitiesAndWires(makeFramesBlock);
        blueprint.addEntitiesAndWires(bytesShiftBlock);

        return blueprint.json();
    }
    // byte: 1 | 2 | 3 | 4

    makeFrames(ii: indexIterator, cc: CoordinateCursor, frameCount: number): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        function deciderFrameSelector(frame: number): any { //FrameSelector
            return {
                conditions: [
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-stack-size"
                        },
                        constant: frame,
                        comparator: "="
                    }
                ],
                outputs: [
                    {
                        signal: {
                            type: "virtual",
                            name: "signal-everything"
                        },
                        networks: {
                            red: false,
                            green: true
                        }
                    }
                ]
            }
        };


        //buildings
        ii.shift(-1);
        cc.dx(-2);
        for (let index = 0; index < frameCount; index++) {
            const itIsLastFrame = index >= frameCount - 1;

            console.log(index, itIsLastFrame);
            console.log("constantCombinator", ii.i);
            block.push(f.constantCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, makeSignals()));
            wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
            
            console.log("deciderCombinator", ii.i);
            block.push(f.deciderCombinator(ii.next(), cc.dx(1), cc.u, Dir.east, deciderFrameSelector(index)));

            if (!itIsLastFrame) {
                wires.push([ii.i, Wire.greenIn, ii.look(2), Wire.greenIn]);
                wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenOut]);
                wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);
            } else {
                wires.push([ii.i, Wire.greenOut, ii.look(1), Wire.greenIn]);
            }
        }

        // block.push(f.deciderCombinator(ii.next(), cc.dx(3), cc.u, Dir.east, deciderFrameSelector(100)));
        return { entities: block, wires: wires };
    }


    makeByteGrid(ii: indexIterator, cc: CoordinateCursor): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];


        let arithmeticGetByte: any = { //LAST BYTE
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

        let arithmeticShiftByte: any = { //SHIFT BYTE
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

        let deciderCord: any = { //CORD
            conditions: [
                {
                    first_signal: {
                        type: "virtual",
                        name: "signal-A"
                    },
                    second_signal: {
                        type: "virtual",
                        name: "signal-A"
                    },
                    comparator: "="
                }
            ],
            outputs: [
                {
                    signal: {
                        type: "virtual",
                        name: "signal-everything"
                    }
                }
            ]
        };

        //building

        block.push(f.arithmeticCombinator(ii.i, cc.x, cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, deciderCord));

        block.push(f.arithmeticCombinator(ii.next(), cc.dx(2), cc.u, Dir.east, arithmeticGetByte));

        return { entities: block, wires: wires };
    }
}

type signal = { [name: string]: number };

function makeSignals(): any {
    return [
        {
            index: 1,
            filters: [
                {
                    index: 1,
                    type: "virtual",
                    name: "signal-0",
                    quality: "normal",
                    comparator: "=",
                    count: 1
                }
            ]
        }
    ]
}