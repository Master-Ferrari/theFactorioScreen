import { Method, blueprintGetter } from "./method.js";
import CanvasManager, { Mode } from "./imageProcessor.js";
import { factorioEntities as f, Blueprint, CoordinateCursor, Dir, Entities, entitiesAndWires, indexIterator, Wire, Wires } from "./factorioEntities.js";
import { group } from "console";
import { allSignals } from "./allSignals.js";

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

        type pixel = { r: number, g: number, b: number };
        // type _row = _pixel[];
        // type _frame = _row[];
        // type _gif = _frame[];
        // type _group = [_pixel | null, _pixel | null, _pixel | null, _pixel | null]
        type pixelsPack = [pixel, pixel, pixel, pixel];
        // type _signalGroup



        type _frameSignals = Signals;
        type _row = { frames: _frameSignals[], width: number };
        type _gifData = { rows: _row[], height: number };


        // const frameCount = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
        // const frameRate = parseInt((document.getElementById('frameRateInput') as HTMLInputElement).value, 10);
        // const currentFrame = parseInt((document.getElementById('frameInput') as HTMLInputElement).value, 10);
        // const gif: _gif = [];

        // for (let i = 0; i < frameCount; i++) { //пересобираем
        //     let frameData = canvasManager.getFrameBitmap(i);
        //     const rows: _row[] = [];
        //     const rowCount = frameData.height;
        //     for (let y = 0; y < rowCount; y++) {
        //         let row: _row = [];
        //         for (let x = 0; x < frameData.width; x++) {
        //             const [r, g, b] = frameData.bitmap[y * frameData.width + x];
        //             row.push({ r, g, b });
        //         }
        //         rows.push(row);
        //     }
        // gif.push(rows);


        // const gif: _gif = [];
        // const gifData = canvasManager.getGifBitmap();

        // const ololo = gifData.frames[0]
        // gif = gifData.frames.map(frame => {
        //     const _frame: _frame = [];


        //     for (let i = 0; i < frame.length; i += gifData.width) {
        //         const row: _row = [];
        //         for (let j = 0; j < gifData.width; j += 4) {
        //             let group: _group;

        //             group = [
        //         }
        //     }


        // })


        function packPixels(pixels: pixelsPack): [number, number, number] {
            if (pixels.length !== 4) {
                throw new Error("Function requires exactly four pixels");
            }
            let number1 = 0;
            let number2 = 0;
            let number3 = 0;
            for (let i = 0; i < 4; i++) {
                const { r, g, b } = pixels[i];
                if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                    throw new Error("Each color component must be between 0 and 255");
                }
                number1 |= (r & 0xff) << (8 * (3 - i));
                number2 |= (g & 0xff) << (8 * (3 - i));
                number3 |= (b & 0xff) << (8 * (3 - i));
            }
            return [number1, number2, number3];
        }



        // for (let f = 0; f < gifData.frames.length; f++) {
        //     const frame = gifData.frames[f];
        //     const rowCount = gifData.height;
        //     const rowLenght = gifData.width;

        //     for (let y = 0; y < rowCount; y++) {
        //         preparedGifData.rows[y] = { frames: [], width: rowLenght };
        //         preparedGifData.rows[y].frames[f] = {};
        //         for (let x = 0; x < rowLenght; x += 4) {
        //             function pixelAdapter(channels: number[]): pixel {
        //                 return {
        //                     r: channels[0],
        //                     g: channels[1],
        //                     b: channels[2]
        //                 }
        //             }

        //             const pixels: pixelsPack = [
        //                 pixelAdapter(frame[y * rowLenght + x] ?? 0),
        //                 pixelAdapter(frame[y * rowLenght + x + 1] ?? 0),
        //                 pixelAdapter(frame[y * rowLenght + x + 2] ?? 0),
        //                 pixelAdapter(frame[y * rowLenght + x + 3] ?? 0),
        //             ];

        //             const packetSignals = packPixels(pixels);


        //             const signals = preparedGifData.rows[y].frames[f];
        //             preparedGifData.rows[y].frames[f]["dsfsd"] = 34;
        //         }
        //     }
        // }

        const gifData = canvasManager.getGifBitmap();
        const preparedGifData: _gifData = {
            rows: [],
            height: gifData.height
        };

        console.log("gifData", gifData);

        const rowCount = gifData.height;
        const rowLenght = gifData.width;


        for (let y = 0; y < rowCount; y++) {
            preparedGifData.rows[y] = { frames: [], width: gifData.width };
            // preparedGifData.rows[y].frames;

            const rowSignals: Signals = {};


            for (let f = 0; f < gifData.frames.length; f++) {
                const frameRow = gifData.frames[f].slice(y * rowLenght, (y + 1) * rowLenght);

                const frameSignals: Signals = {};
                let currentPixel = 0;
                for (let x = 0; x < rowLenght; x += 4) {
                    function pixelAdapter(channels: number[]): pixel {
                        return {
                            r: channels[0],
                            g: channels[1],
                            b: channels[2]
                        }
                    }

                    const pixels: pixelsPack = [
                        pixelAdapter(frameRow[x] ?? 0),
                        pixelAdapter(frameRow[x + 1] ?? 0),
                        pixelAdapter(frameRow[x + 2] ?? 0),
                        pixelAdapter(frameRow[x + 3] ?? 0),
                    ];


                    const packetSignals = packPixels(pixels);
                    // console.log("allSignals", allSignals);
                    for (let i = 0; i < 3; i++) {
                        const signalNum = currentPixel + i;
                        console.log("signalNum", signalNum);
                        frameSignals[allSignals[signalNum]] = packetSignals[i];
                    }
                    currentPixel += 3;
                }
                preparedGifData.rows[y].frames.push(frameSignals);
            }


        }

        console.log("preparedGifData", preparedGifData);



        // gif.forEach(frame => {
        //     frame.forEach(row => {
        //         const groups: _fullGroup[] = [];

        //         for (let i = 0; i < row.length; i += 4) {
        //             groups.push([
        //                 row[i] ?? 0,
        //                 row[i + 1] ?? 0,
        //                 row[i + 2] ?? 0,
        //                 row[i + 3] ?? 0
        //             ]);
        //         }

        //         const signalValues: number[] = [];

        //         groups.forEach(group => {

        //             const packetSignals = packPixels(group);

        //             signalValues.push(...Object.values(packetSignals));

        //         })
        //         const signals: Signals = {};

        //         signalValues.forEach((value, index) => {
        //             signals[allSignals[index]] = value;
        //         });

        //         console.log("Signals", signals);
        //         console.log("makeSignals", makeSignals(signals));




        //     })


        // });


        // let lamps: Entities = [];
        // for (let i = 0; i < frameData.bitmap.length; i++) {
        //     const x = (i % frameData.width) + 0.5;
        //     const y = Math.floor(i / frameData.width) + 0.5;
        //     const [r, g, b] = frameData.bitmap[i];
        //     lamps.push(f.simpleLamp(i + 1, x, y, r, g, b));
        // }

        const blueprint = new Blueprint();
        const cc = new CoordinateCursor(0, 0);
        const ii = new indexIterator(1);

        // const makeFramesBlock = this.makeFrames(ii, cc, 4);
        // cc.dx(1);
        // ii.shift(1);
        // const bytesShiftBlock = this.makeByteGrid(ii, cc);

        // blueprint.addEntitiesAndWires(makeFramesBlock);
        // blueprint.addEntitiesAndWires(bytesShiftBlock);

        const row = this.makeRow(ii, cc);

        blueprint.addEntitiesAndWires(row);

        return blueprint.json();
    }
    // byte: 1 | 2 | 3 | 4

    makeRow(ii: indexIterator, cc: CoordinateCursor): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        const makeFramesBlock = this.makeFrames(ii, cc, 4);
        cc.dx(1);
        ii.shift(1);
        const bytesShiftBlock = this.makeByteGrid(ii, cc);

        block.push(...makeFramesBlock.entities, ...bytesShiftBlock.entities);
        wires.push(...makeFramesBlock.wires, ...bytesShiftBlock.wires);

        return { entities: block, wires: wires };
    }

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
        // cc.dx(-2);
        for (let index = 0; index < frameCount; index++) {
            const itIsLastFrame = index >= frameCount - 1;

            console.log(index, itIsLastFrame);
            console.log("constantCombinator", ii.i);
            block.push(f.constantCombinator(ii.next(), cc.px(1), cc.u, Dir.east, makeSignals()));
            wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);

            console.log("deciderCombinator", ii.i);
            block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderFrameSelector(index)));

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

        block.push(f.arithmeticCombinator(ii.i, cc.px(2), cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.u, Dir.east, deciderCord));

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.u, Dir.east, arithmeticGetByte));

        return { entities: block, wires: wires };
    }
}

type Signals = { [name: string]: number };
function makeSignals(signals: Signals = {}): any {
    return [
        {
            index: 1,
            filters: Object.keys(signals).map(key => {
                return {
                    signal: {
                        type: "virtual",
                        name: key
                    },
                    count: signals[key]
                }
            })
        }
    ]
}