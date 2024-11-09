import { Method, blueprintGetter } from "./method.js";
import CanvasManager, { GifBitmap, Mode } from "./imageProcessor.js";
import { factorioEntities as f, Blueprint, CoordinateCursor, Dir, Entities, entitiesAndWires, indexIterator, Wire, Wires, RgbSignalsNames } from "./factorioEntities.js";
import { group } from "console";
import { allSignals } from "./allSignals.js";


type pixel = { r: number, g: number, b: number };
type pixelsPack = [pixel, pixel, pixel, pixel];



type _frameSignals = Signals;
type _row = { frames: _frameSignals[], width: number };
type _gifData = { rows: _row[], height: number };

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
    //#region makeJson
    makeJson(): string {

        const gifData = canvasManager.getGifBitmap();
        const preparedGifData = this.gifDataTopreparedGifData(gifData);


        const blueprint = new Blueprint();
        const cc = new CoordinateCursor(0, 0);
        const ii = new indexIterator(1);

        for (let y = 0; y < preparedGifData.rows.length; y++) {
            const rowData = preparedGifData.rows[y];
            const oldCC = cc.xy;

            const row = this.makeRow(ii, cc, rowData.frames, rowData.frames[0], rowData.width);

            blueprint.addEntitiesAndWires(row);
            cc.setxy({ x: oldCC.x, y: oldCC.y + 1 });
        }

        const frameDecidersPairs = ii.getpairs("frame decider combinator");
        frameDecidersPairs.forEach(pair => {
            blueprint.addWires([[pair[0], Wire.redIn, pair[1], Wire.redIn]]);
        })

        return blueprint.json();
    }
    //#endregion

    //#region subblueprints
    makeRow(ii: indexIterator, cc: CoordinateCursor, frames: Signals[], currentFrame: Signals, width: number): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        const beforeFrameBlock = cc.xy;
        const makeFramesBlock = this.makeFrames(ii, cc, frames);
        cc.setxy(beforeFrameBlock);
        ii.shift(1);
        const bytesShiftBlock = this.makeByteGrid(ii, cc);

        const lamps = this.makeLamps(ii, cc, currentFrame, width);
        ii.shift(1);



        block.push(...makeFramesBlock.entities, ...bytesShiftBlock.entities, ...lamps.entities);
        wires.push(...makeFramesBlock.wires, ...bytesShiftBlock.wires, ...lamps.wires);



        return { entities: block, wires: wires };
    }

    makeSequencer(ii: indexIterator, cc: CoordinateCursor, fps: number, framesCount: number): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];
        

        
        // block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderFrameSelector(index)));


        return { entities: block, wires: wires };
    }

    makeFrames(ii: indexIterator, cc: CoordinateCursor, frames: Signals[]): entitiesAndWires {
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
        cc.dx(-frames.length * 3);


        ii.shift(-1);
        for (let index = 0; index < frames.length; index++) {
            const itIsLastFrame = index >= frames.length - 1;

            block.push(f.constantCombinator(ii.next(), cc.px(1), cc.y, Dir.east, makeSignals(frames[index])));
            wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);

            block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderFrameSelector(index)));

            if (!itIsLastFrame) {
                wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenOut]);
                wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);
            } else {
                ii.addPairMember("frame decider combinator", ii.i); // вертикальный перенос сигнала кадра

                wires.push([ii.i, Wire.greenOut, ii.look(1), Wire.greenIn]);
            }
        }

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

        block.push(f.arithmeticCombinator(ii.i, cc.px(2), cc.y, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(3), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticGetByte));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticShiftByte));
        wires.push([ii.i, Wire.greenOut, ii.look(4), Wire.greenIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));

        block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderCord));

        block.push(f.arithmeticCombinator(ii.next(), cc.px(2), cc.y, Dir.east, arithmeticGetByte));

        return { entities: block, wires: wires };
    }


    makeLamps(ii: indexIterator, cc: CoordinateCursor, frames: Signals, width: number): { entities: Entities, wires: Wires } {

        const block: Entities = [];
        const wires: Wires = [];

        const signalNamesRgbGroups: RgbSignalsNames[] = [];
        const keys: string[] = Object.keys(frames);


        for (let i = 0; i < keys.length; i += 3) {
            signalNamesRgbGroups.push({
                rName: keys[i] ?? "wube-logo-space-platform",
                gName: keys[i + 1] ?? "wube-logo-space-platform",
                bName: keys[i + 2] ?? "wube-logo-space-platform"
            });
        }

        let e = 0;
        cc.dx(-1);
        for (let i = 0; i < width; i++) {
            const packIndex = Math.floor(i / 4);

            block.push(f.rgbLamp(ii.next(), cc.dx(1), cc.y, signalNamesRgbGroups[packIndex]));

            if (packIndex == 0) {
                wires.push([ii.i, Wire.greenIn, ii.look(-4), Wire.greenOut]);
            } else {
                wires.push([ii.i, Wire.greenIn, ii.look(-4), Wire.greenIn]);
            }
        }


        return { entities: block, wires: wires };
    }


    //#endregion
    /////////////////////////////////////////
    //#region stuff functions

    gifDataTopreparedGifData(gifData: GifBitmap): _gifData {

        const preparedGifData: _gifData = {
            rows: [],
            height: gifData.height
        };

        console.log("gifData", gifData);

        const rowCount = gifData.height;
        const rowLenght = gifData.width;


        for (let y = 0; y < rowCount; y++) {
            preparedGifData.rows[y] = { frames: [], width: gifData.width };

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
                        pixelAdapter(frameRow[x + 3] ?? 0),
                        pixelAdapter(frameRow[x + 2] ?? 0),
                        pixelAdapter(frameRow[x + 1] ?? 0),
                        pixelAdapter(frameRow[x] ?? 0),
                    ];


                    const packetSignals = this.packPixels(pixels);
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

        return preparedGifData;

    }

    packPixels(pixels: pixelsPack): [number, number, number] {
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
    //#endregion

}

type Signals = { [name: string]: number };
function makeSignals(signals: Signals = {}): any {
    const signalJsons: any = [];
    let i = 1;
    return [
        {
            index: 1,
            filters: Object.keys(signals).map(key => {
                return {
                    index: i++,
                    type: "virtual",
                    quality: "normal",
                    comparator: "=",
                    name: key,
                    count: signals[key]
                }
            })
        }
    ]
}