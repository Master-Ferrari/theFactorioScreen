import { Method, blueprintGetter, updateOptions } from "./method.js";
import ImageProcessor, { GifBitmap, Mode } from "./imageProcessor.js";
import { factorioEntities as f, Blueprint, CoordinateCursor, Dir, Entities, entitiesAndWires, indexIterator, Wire, Wires, RgbSignalsNames, Signals, makeSignals, makeSignalSections, gapsSizes } from "./factorioEntities.js";
// import { group } from "console";
import { allSignals, getTypeByName } from "./allSignals.js";
// import { constants } from "buffer";
import { Tight3to4CanvasManager } from "./tight3to4Canvas.js";
import { HtmlCreator as Html } from "./htmlStuff.js";
// import { Dropdown } from "./dropdown.js";

type pixel = { r: number, g: number, b: number };
type pixelsPack = [pixel, pixel, pixel, pixel];



type _frameSignals = Signals;
type _row = { frames: _frameSignals[], width: number };
type _gifData = { rows: _row[], height: number };


export default class tight3to4Method extends Method {
    readonly name = "tight3to4";
    readonly value = "tight video player";
    readonly supportedModes: Mode[] = ["gif"];

    private imageProcessor: ImageProcessor;

    private infoTextChange: ((text: string) => void) | null = null;

    private tight3to4CanvasManager: Tight3to4CanvasManager | null = null;

    private gridIsEnabled: boolean = false;
    private gridGap: number = gapsSizes[0];
    private gridPlus: number = this.gridGap + 2;
    private substationsQuality: number = 0;
    private gridOffset: { x: number, y: number } = { x: 0, y: 0 };

    private options: updateOptions | null = null;

    constructor(optionsContainer: HTMLElement, blueprintGetter: blueprintGetter) {
        super(optionsContainer, blueprintGetter);


        this.imageProcessor = ImageProcessor.getInstance();

    }

    init(): void {
        //#region inputs
        const self = this;
        const mainCanvas = document.getElementById("canvas") as HTMLCanvasElement;

        const methodContainer = Html.createCenterContainer();

        const canvasContainer = document.createElement('div');
        canvasContainer.style.alignItems = 'center';

        const controlsContainer = Html.createControlsContainer();

        const gridLabel = Html.addLabel("power substations grid");
        const gridCheckbox = Html.addCheckbox("gridCheckbox", false);

        gridCheckbox.element.addEventListener('change', function () {
            self.gridIsEnabled = this.checked;
            self.canvasUpdate();
        });

        controlsContainer.appendChild(gridLabel);
        controlsContainer.appendChild(gridCheckbox.container);

        const gridGapLabel = Html.addLabel("substation quality");
        // const gridGapInput = Html.createNumberInput("lepQuality", 1, 5, 1);
        const gridQuality = Html.createDropdown({
            optionsList: [
                { name: "0", value: "normal", isActive: true },
                { name: "1", value: "uncommon", isActive: true },
                { name: "2", value: "rare", isActive: true },
                { name: "3", value: "epic", isActive: true },
                { name: "4", value: "legendary", isActive: true },
            ],
            onSelectCallback: (index) => {
                this.substationsQuality = index ?? 0;
                this.gridGap = [16, 18, 20, 22, 26][index ?? 0];
                this.gridPlus = this.gridGap + 2;
                self.canvasUpdate();
            },
            defaultText: "normal",
            selectedPrefix: "",
            id: "substationQuality"
        });

        controlsContainer.appendChild(gridGapLabel);
        controlsContainer.appendChild(gridQuality);

        const offsetContainer = Html.createXYInput(
            { id: "offsetX", min: -100, max: 100, value: 0 },
            { id: "offsetY", min: -100, max: 100, value: 0 }
        );
        const offsetLabel = Html.addLabel("offset");

        offsetContainer.xInput.addEventListener('input', function () {
            self.gridOffset.x = parseInt(this.value);
            self.canvasUpdate();
        });
        offsetContainer.yInput.addEventListener('input', function () {
            self.gridOffset.y = parseInt(this.value);
            self.canvasUpdate();
        });


        controlsContainer.appendChild(offsetLabel);
        controlsContainer.appendChild(offsetContainer.container);

        canvasContainer.appendChild(controlsContainer);

        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.margin = "15px auto"
        canvas.id = 'canvas';
        // canvas.style.imageRendering = 'auto';

        canvasContainer.appendChild(canvas);

        const strokeText = Html.strokeText();

        strokeText.element.style.transform = "translate(10px, -40px)";
        strokeText.element.style.opacity = "0.8";
        this.infoTextChange = strokeText.changeText;

        canvasContainer.appendChild(strokeText.element);

        methodContainer.appendChild(canvasContainer);


        this.tight3to4CanvasManager = Tight3to4CanvasManager.getInstance(canvas, mainCanvas);

        const button = Html.createButton("generate blueprint!", () => {
            console.log("LoL")
            this.exportJson(this.makeJson());
        });
        methodContainer.appendChild(button);

        while (this.optionsContainer.firstChild) {
            this.optionsContainer.removeChild(this.optionsContainer.firstChild);
        }

        this.optionsContainer.appendChild(methodContainer);
        //#endregion
    }

    destroy(): void {
        if (this.tight3to4CanvasManager) {
            Tight3to4CanvasManager.destroyInstance();
            this.tight3to4CanvasManager = null;
        }

        while (this.optionsContainer.firstChild) {
            this.optionsContainer.removeChild(this.optionsContainer.firstChild);
        }
    }

    update(options: updateOptions): void {
        // this.frameCount = options.frameCount;
        // this.currentFrame = options.currentFrame;
        // this.mode = options.mode;
        this.options = options;
        this.canvasUpdate(options);
    }

    canvasUpdate(options: updateOptions = this.options ?? { frameCount: 1, currentFrame: 0, mode: "gif" }): void {
        const infotext = this.tight3to4CanvasManager?.update(options.frameCount, this.gridIsEnabled, this.gridGap, this.gridOffset) ?? "";
        this.infoTextChange?.(infotext);
    }

    //#region makeJson
    makeJson(): string {

        const gifData = this.imageProcessor.getGifBitmap();
        const preparedGifData = this.gifDataToPreparedGifData(gifData);

        // надо бы тут короче сделать сетку из лэпов и придумать массив координат для обхода

        // а лучше
        // режим избегания в курсоре
        // включается когда надо избегать
        // пропускает координаты
        // точнее просто подрубает формулу

        const blueprint = new Blueprint();
        const cc = new CoordinateCursor(0, 0);
        const ii = new indexIterator(0);

        const imageWidth = preparedGifData.rows[0].width;


        ii.shift(1);


        for (let y = 0; y < preparedGifData.rows.length; y++) {
            const rowData = preparedGifData.rows[y];
            const oldCC = cc.xy;

            const isItLastRow = y == preparedGifData.rows.length - 1;
            const isItFirstRow = y == 0;

            const row = this.makeRow(ii, cc, rowData.frames, rowData.frames[0], rowData.width, isItLastRow, isItFirstRow);

            blueprint.addEntitiesAndWires(row);
            cc.sxy({ x: oldCC.x, y: oldCC.y + 1 });
        }

        // cc.dx(-2);
        const framesCount = preparedGifData.rows[0].frames.length;
        const Sequencer = this.makeSequencer(ii, cc.dxycc({ x: -3, y: 0 }), gifData.tpf, framesCount);
        blueprint.addEntitiesAndWires(Sequencer);



        /////////////////
        console.log("sadsdfsd", cc.xy);
        cc.sxy({ x: 26 + imageWidth - 2 + (this.gridOffset.x) % this.gridGap, y: (this.gridOffset.y) % this.gridGap });
        blueprint.addEntities([f.substation(ii.next(), cc.x, cc.y, this.substationsQuality)]);
        const test = this.makeElectricGrid(ii, cc);
        blueprint.addEntitiesAndWires(test);


        const frameDecidersPairs = ii.getpairs("frame decider combinator");
        console.log("test20-frameDecidersPairs", frameDecidersPairs);
        frameDecidersPairs.forEach(pair => {
            blueprint.addWires([[pair[0], Wire.redIn, pair[1], Wire.redIn]]);
        })

        const mainClockWire = ii.getpairs("main clock")[0];
        blueprint.addWires([[mainClockWire[0], Wire.redIn, mainClockWire[1], Wire.redOut]]);

        console.log(this.gridIsEnabled, this.gridGap, this.gridOffset);
        console.log({ x: 26 + imageWidth + this.gridOffset.x, y: this.gridOffset.y });



        return blueprint.json();
    }
    //#endregion

    //#region subblueprints

    makeElectricGrid(ii: indexIterator, cc: CoordinateCursor): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        const xim = Math.ceil(((this.tight3to4CanvasManager?.getSize().width ?? 0) + (this.gridPlus / 2)) / this.gridPlus);
        const yim = Math.ceil(((this.tight3to4CanvasManager?.getSize().height ?? 0) + (this.gridPlus / 2)) / this.gridPlus);

        // ii.shift(-1);


        const startC = cc.xy;

        for (let yi = 0; yi < yim; yi++) {
            for (let xi = 0; xi < xim; xi++) {

                block.push(f.substation(ii.next(), cc.sx(startC.x - this.gridPlus * xi), cc.sy(startC.y + this.gridPlus * yi), xi == yi && xi == 0 ? 4 : this.substationsQuality));

                if (xi < xim - 1) wires.push([ii.i, Wire.coper, ii.look(1), Wire.coper]);

                if (yi < yim - 1) wires.push([ii.i, Wire.coper, ii.look(xim), Wire.coper]);
            }
        }

        return { entities: block, wires: wires };
    }


    makeRow(ii: indexIterator, cc: CoordinateCursor, frames: Signals[], currentFrame: Signals, width: number, isItLastRow: boolean, isItFirstRow: boolean): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        const beforeFrameBlock = cc.xy;
        const makeFramesBlock = this.makeFrames(ii, cc, frames, isItLastRow, isItFirstRow);
        cc.sxy(beforeFrameBlock);
        ii.shift(1);
        const bytesShiftBlock = this.makeByteGrid(ii, cc);

        const lamps = this.makeLamps(ii, cc, currentFrame, width);
        ii.shift(1);



        block.push(...makeFramesBlock.entities, ...bytesShiftBlock.entities, ...lamps.entities);
        wires.push(...makeFramesBlock.wires, ...bytesShiftBlock.wires, ...lamps.wires);



        return { entities: block, wires: wires };
    }

    makeSequencer(ii: indexIterator, cc: CoordinateCursor, tpf: number, framesCount: number): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        function deciderFrameLenght(tpf: number): any { // длина кадра в тиках
            return {
                conditions: [
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        constant: tpf
                    }
                ],
                outputs: [
                    {
                        signal: {
                            type: "virtual",
                            name: "signal-green"
                        }
                    }
                ]
            }
        };

        function deciderFrameCount(count: number): any { // количество кадров
            return {
                conditions: [
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        constant: count,
                        first_signal_networks: {
                            red: false,
                            green: true
                        }
                    },
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-red"
                        },
                        comparator: "=",
                        compare_type: "and"
                    }
                ],
                outputs: [
                    {
                        signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        networks: {
                            red: false,
                            green: true
                        }
                    }
                ]
            }
        };

        function deciderReset(): any { // сброс
            return {
                conditions: [
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        constant: 1,
                        comparator: "=",
                        first_signal_networks: {
                            red: true,
                            green: false
                        }
                    },
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        constant: 1,
                        comparator: "=",
                        first_signal_networks: {
                            red: false,
                            green: true
                        },
                        compare_type: "and"
                    }
                ],
                outputs: [
                    {
                        signal: {
                            type: "virtual",
                            name: "signal-green"
                        },
                        "copy_count_from_input": false
                    }
                ]
            }
        };


        const sections = makeSignalSections([
            { signals: makeSignals({ "signal-green": 1 }), active: true, sectionName: "play[virtual-signal=signal-check]" },
            { signals: makeSignals({ "signal-red": 1 }), active: false, sectionName: "stop[virtual-signal=signal-red]" },
        ]);

        //building

        block.push(f.deciderCombinator(ii.next(), cc.px(1), cc.y, Dir.north, deciderFrameCount(framesCount)));
        wires.push([ii.i, Wire.greenIn, ii.i, Wire.greenOut]);
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenOut]);
        wires.push([ii.i, Wire.redIn, ii.look(1), Wire.redIn]);

        ii.addPairMember("main clock", ii.i);

        block.push(f.deciderCombinator(ii.next(), cc.px(1), cc.y, Dir.north, deciderReset()));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenOut]);
        wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);

        block.push(f.deciderCombinator(ii.next(), cc.px(1), cc.y, Dir.north, deciderFrameLenght(tpf)));
        wires.push([ii.i, Wire.greenIn, ii.i, Wire.greenOut]);
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);

        block.push(f.constantCombinator(ii.next(), cc.px(1), cc.dy(1), Dir.south, sections, { playerDescription: "Media control" }));

        return { entities: block, wires: wires };
    }

    makeFrames(ii: indexIterator, cc: CoordinateCursor, frames: Signals[], isItLastRow: boolean, isItFirstRow: boolean): entitiesAndWires {
        let block: Entities = [];
        let wires: Wires = [];

        function deciderFrameSelector(frame: number): any { //FrameSelector
            return {
                conditions: [
                    {
                        first_signal: {
                            type: "virtual",
                            name: "signal-green"
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


        //building
        cc.dx(-frames.length * 3);


        ii.shift(-1);
        for (let index = 0; index < frames.length; index++) {
            const itIsLastFrame = index >= frames.length - 1;

            // console.log("test22-makeSignalsConstantCombinator", f.constantCombinator(ii.next(), cc.px(1), cc.y, Dir.east, makeSignals(frames[index])));

            block.push(f.constantCombinator(ii.next(), cc.px(1), cc.y, Dir.east, makeSignals(frames[index])));
            wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);

            block.push(f.deciderCombinator(ii.next(), cc.px(2), cc.y, Dir.east, deciderFrameSelector(index)));

            if (!itIsLastFrame) {
                wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenOut]);
                wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);
            } else {

                ii.addPairMember("frame decider combinator", ii.i); // вертикальный перенос сигнала кадра
                if (!isItFirstRow) {
                    ii.addPairMember("frame decider combinator", ii.i); // повторяем чтобы ну... короче блин,, да
                }

                if (isItLastRow) {
                    ii.addPairMember("main clock", ii.i);
                }

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

    gifDataToPreparedGifData(gifData: GifBitmap): _gifData {

        const preparedGifData: _gifData = {
            rows: [],
            height: gifData.height
        };

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
                    for (let i = 0; i < 3; i++) {
                        const signalNum = currentPixel + i;
                        frameSignals[allSignals[signalNum]] = packetSignals[i];
                    }
                    currentPixel += 3;
                }
                preparedGifData.rows[y].frames.push(frameSignals);
            }
        }

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
