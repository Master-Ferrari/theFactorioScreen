import { Method } from "./method.js";
import ImageProcessor from "./imageProcessor.js";
import { factorioEntities as f, Blueprint, CoordinateCursor, Dir, indexIterator, Wire, makeSignals, makeSignalSections, gapsSizes } from "./factorioEntities.js";
// import { group } from "console";
import { allSignals } from "./allSignals.js";
// import { constants } from "buffer";
import { defaultDridData, Tight3to4CanvasManager } from "./tight3to4Canvas.js";
import { HtmlCreator as Html } from "./htmlStuff.js";
import { AlertManager } from "./alertManager.js";
export default class tight3to4Method extends Method {
    constructor(optionsContainer, blueprintGetter) {
        super(optionsContainer, blueprintGetter);
        this.name = "tight3to4";
        this.value = "tight video player";
        this.supportedModes = ["gif", "pngSequence"];
        this.alertManager = AlertManager.getInstance();
        this.infoTextChange = null;
        this.tight3to4CanvasManager = null;
        this.onlyFrame = false;
        this.disableSubstations = false;
        this.firstFrameClip = 0;
        this.lastFrameClip = 0;
        this.firstFrameClipInput = null;
        this.lastFrameClipInput = null;
        this.gridIsEnabled = false;
        this.gridGap = gapsSizes[0];
        this.gridPlus = this.gridGap + 2;
        this.substationsQuality = 0;
        this.gridOffset = { x: 0, y: 0 };
        this.options = null;
        this.sequencerStartXY = { x: 0, y: 0 };
        this.imageProcessor = ImageProcessor.getInstance();
    }
    init() {
        //#region inputs
        const scrollContainer = Html.createScrollContainer(140);
        const self = this;
        const mainCanvas = document.getElementById("canvas");
        const methodContainer = Html.createCenterContainer();
        const canvasContainer = document.createElement('div');
        canvasContainer.style.alignItems = 'center';
        const controlsContainer = Html.createControlsContainer();
        const gridLabel = Html.addLabel("electric grid");
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
            id: "substationQuality",
            parent: scrollContainer
        });
        controlsContainer.appendChild(gridGapLabel);
        controlsContainer.appendChild(gridQuality);
        const offsetContainer = Html.createXYInput({ id: "offsetX", min: -100, max: 100, value: 0 }, { id: "offsetY", min: -100, max: 100, value: 0 });
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
        const separator1 = Html.createSeparator("10px");
        const separator2 = Html.createSeparator("10px");
        const separator3 = document.createElement('div');
        separator3.innerText = "additional stuff";
        const separator4 = document.createElement('div');
        const separator5 = Html.createSeparator("10px");
        const separator6 = Html.createSeparator("10px");
        controlsContainer.appendChild(separator1);
        controlsContainer.appendChild(separator2);
        controlsContainer.appendChild(separator3);
        controlsContainer.appendChild(separator4);
        controlsContainer.appendChild(separator5);
        controlsContainer.appendChild(separator6);
        const onlyFrameLabel = Html.addLabel("only frame data");
        const onlyFrameCheckbox = Html.addCheckbox("onlyFrame", false);
        onlyFrameCheckbox.element.addEventListener('change', function () {
            self.onlyFrame = this.checked;
            self.canvasUpdate();
        });
        controlsContainer.appendChild(onlyFrameLabel);
        controlsContainer.appendChild(onlyFrameCheckbox.container);
        const disableSubstationsLabel = Html.addLabel("also disable substations");
        const disableSubstationsCheckbox = Html.addCheckbox("disableSubstations", false);
        disableSubstationsCheckbox.element.addEventListener('change', function () {
            self.disableSubstations = this.checked;
            self.canvasUpdate();
        });
        controlsContainer.appendChild(disableSubstationsLabel);
        controlsContainer.appendChild(disableSubstationsCheckbox.container);
        scrollContainer.appendChild(controlsContainer);
        const firstFrameClipLabel = Html.addLabel("first frame index");
        const firstFrameClipInput = Html.createNumberInput("frameClip", 0, 0);
        this.firstFrameClipInput = firstFrameClipInput;
        firstFrameClipInput.addEventListener('input', function () {
            self.firstFrameClip = parseInt(this.value);
            self.canvasUpdate();
        });
        controlsContainer.appendChild(firstFrameClipLabel);
        controlsContainer.appendChild(firstFrameClipInput);
        const mnogo = 999999999999;
        const lastFrameClipLabel = Html.addLabel("last frame index");
        const lastFrameClipInput = Html.createNumberInput("frameClip", mnogo, 0, mnogo);
        this.lastFrameClipInput = lastFrameClipInput;
        lastFrameClipInput.addEventListener('input', function () {
            self.lastFrameClip = parseInt(this.value);
            self.canvasUpdate();
        });
        self.lastFrameClip = mnogo;
        controlsContainer.appendChild(lastFrameClipLabel);
        controlsContainer.appendChild(lastFrameClipInput);
        canvasContainer.appendChild(scrollContainer);
        const canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.margin = "15px auto";
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
            console.log("LoL");
            this.exportJson(this.makeJson());
        });
        methodContainer.appendChild(button);
        while (this.optionsContainer.firstChild) {
            this.optionsContainer.removeChild(this.optionsContainer.firstChild);
        }
        this.optionsContainer.appendChild(methodContainer);
        //#endregion
    }
    destroy() {
        if (this.tight3to4CanvasManager) {
            Tight3to4CanvasManager.destroyInstance();
            this.tight3to4CanvasManager = null;
        }
        while (this.optionsContainer.firstChild) {
            this.optionsContainer.removeChild(this.optionsContainer.firstChild);
        }
        this.alertManager.setAlert("wrongXOffset", false);
    }
    update(options) {
        this.updateFrameCount(options.frameCount);
        // this.frameCount = options.frameCount;
        // this.currentFrame = options.currentFrame;
        // this.mode = options.mode;
        this.options = options;
        this.canvasUpdate(options);
    }
    canvasUpdate(options = this.options ?? { frameCount: 1, currentFrame: 0, mode: "gif" }) {
        const infotext = this.tight3to4CanvasManager?.update(options.frameCount, this.gridIsEnabled, this.gridGap + 2, this.gridOffset, this.onlyFrame, this.firstFrameClip, this.lastFrameClip) ?? "";
        this.infoTextChange?.(infotext);
    }
    //#region makeJson
    makeJson() {
        const gifData = this.imageProcessor.getSequenceBitmap();
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
        // electric grid
        if (this.gridIsEnabled) {
            const oldXY = cc.xy;
            console.log("sadsdfsd", cc.xy);
            // cc.sxy({ x: (this.gridOffset.x) % this.gridGap - 1, y: (this.gridOffset.y) % this.gridGap });
            cc.sxy({ x: -1, y: 0 });
            const electricGrid = this.makeElectricGrid(ii, cc);
            blueprint.addEntitiesAndWires(electricGrid);
            cc.sxy(oldXY);
        }
        ii.shift(1);
        for (let y = 0; y < preparedGifData.rows.length; y++) { // строчки всего вместе
            const rowData = preparedGifData.rows[y];
            const oldCC = cc.xy;
            const isItLastRow = y == preparedGifData.rows.length - 1;
            const isItFirstRow = y == 0;
            const row = this.makeRow(ii, cc, rowData.frames, rowData.frames[0], rowData.width, isItLastRow, isItFirstRow);
            blueprint.addEntitiesAndWires(row);
            cc.sxy({ x: oldCC.x, y: oldCC.y + 1 });
        }
        const frameDecidersPairs = ii.getpairs("frame decider combinator"); // вертикальный проводочек
        console.log("test20-frameDecidersPairs", frameDecidersPairs);
        frameDecidersPairs.forEach(pair => {
            blueprint.addWires([[pair[0], Wire.redIn, pair[1], Wire.redIn]]);
        });
        const framesCount = preparedGifData.rows[0].frames.length; // секвенсер
        console.log("test6-this.sequencerStartXY", this.sequencerStartXY);
        cc.sxy(this.sequencerStartXY);
        cc.dx(2);
        cc.checkRestrictionAndMove(4);
        const Sequencer = this.makeSequencer(ii, cc, gifData.tpf, framesCount);
        blueprint.addEntitiesAndWires(Sequencer);
        const mainClockWire = ii.getpairs("main clock")[0]; // проводочек секвенсора
        blueprint.addWires([[mainClockWire[0], Wire.redIn, mainClockWire[1], Wire.redOut]]);
        return blueprint.json();
    }
    //#endregion
    //#region subblueprints
    makeElectricGrid(ii, cc) {
        let block = [];
        let wires = [];
        const xim = Math.ceil((this.tight3to4CanvasManager?.getSize().width ?? 0) / this.gridPlus); //максимумы
        const yim = Math.ceil((this.tight3to4CanvasManager?.getSize().height ?? 0) / this.gridPlus); // тут проблема в том что мы не знаем что будет максимумом на скамом деле. нужно брать координаты из канваса. иначе никак...
        // ii.shift(-1);
        const gridData = this.tight3to4CanvasManager?.gridArray ?? defaultDridData;
        const startC = cc.xy;
        console.log("test30-gridData", gridData);
        gridData.y.forEach(dataY => {
            const y = startC.y + dataY;
            gridData.x.forEach(dataX => {
                const x = startC.x + dataX - gridData.totalWidth + 2;
                console.log("test30-x", x);
                block.push(f.substation(ii.next(), cc.sx(x), cc.sy(y), this.substationsQuality));
                if (dataX != gridData.xMax)
                    wires.push([ii.i, Wire.coper, ii.look(1), Wire.coper]);
                if (dataY != gridData.yMax)
                    wires.push([ii.i, Wire.coper, ii.look(gridData.rowLenght), Wire.coper]);
                cc.addRestrictedColumns([(x), (x - 1)]);
            });
            cc.addRestrictedRows([(y), (y + 1)]);
        });
        console.log("test31-restricted", cc.restrictedColumns, cc.restrictedRows);
        // for (let yi = 0; yi < yim; yi++) {
        //     const y = startC.y + this.gridPlus * yi;
        //     for (let xi = 0; xi < xim; xi++) {
        //         const x = startC.x - this.gridPlus * xi;
        //         block.push(f.substation(ii.next(), cc.sx(x), cc.sy(y), this.substationsQuality));
        //         if (xi < xim - 1) wires.push([ii.i, Wire.coper, ii.look(1), Wire.coper]);
        //         if (yi < yim - 1) wires.push([ii.i, Wire.coper, ii.look(xim), Wire.coper]);
        //         if (yi == 0) {
        //             cc.addRestrictedColumns([(x), (x - 1)]);
        //         }
        //     }
        //     cc.addRestrictedRows([(y), (y + 1)]);
        // }
        return { entities: block, wires: wires };
    }
    makeRow(ii, cc, frames, currentFrame, width, isItLastRow, isItFirstRow) {
        let block = [];
        let wires = [];
        const lamps = this.makeLamps(ii, cc, currentFrame, width);
        const bytesShiftBlock = this.makeDecoder(ii, cc);
        // cc.restrictProtection = false;
        // const beforeFrameBlock = cc.xy;
        const makeFramesBlock = this.makeFrames(ii, cc, frames, isItLastRow, isItFirstRow);
        // cc.sxy(beforeFrameBlock);
        // ii.shift(1);
        // cc.restrictProtection = true;
        // ii.shift(1);
        block.push(...lamps.entities, ...bytesShiftBlock.entities, ...makeFramesBlock.entities);
        wires.push(...lamps.wires, ...bytesShiftBlock.wires, ...makeFramesBlock.wires);
        // block.push(...makeFramesBlock.entities, ...bytesShiftBlock.entities, ...lamps.entities);
        // wires.push(...makeFramesBlock.wires, ...bytesShiftBlock.wires, ...lamps.wires);
        return { entities: block, wires: wires };
    }
    makeSequencer(ii, cc, tpf, framesCount) {
        let block = [];
        let wires = [];
        function deciderFrameLenght(tpf) {
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
            };
        }
        ;
        function deciderFrameCount(count) {
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
            };
        }
        ;
        function deciderReset() {
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
            };
        }
        ;
        const sections = makeSignalSections([
            { signals: makeSignals({ "signal-green": 1 }), active: true, sectionName: "play[virtual-signal=signal-check]" },
            { signals: makeSignals({ "signal-red": 1 }), active: false, sectionName: "stop[virtual-signal=signal-red]" },
        ]);
        //building
        block.push(f.constantCombinator(ii.next(), cc.px(-1), cc.dy(2), Dir.south, sections, { playerDescription: "Media control", entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(3), Wire.greenIn]);
        wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);
        block.push(f.deciderCombinator(ii.next(), cc.px(-1), cc.dy(-1), Dir.north, deciderFrameCount(framesCount), { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.i, Wire.greenOut]);
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenOut]);
        wires.push([ii.i, Wire.redIn, ii.look(1), Wire.redIn]);
        ii.addPairMember("main clock", ii.i);
        block.push(f.deciderCombinator(ii.next(), cc.px(-1), cc.y, Dir.north, deciderReset(), { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenOut]);
        block.push(f.deciderCombinator(ii.next(), cc.px(-1), cc.y, Dir.north, deciderFrameLenght(tpf), { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.i, Wire.greenOut]);
        return { entities: block, wires: wires };
    }
    makeFrames(ii, cc, frames, isItLastRow, isItFirstRow) {
        let block = [];
        let wires = [];
        function deciderFrameSelector(frame) {
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
            };
        }
        ;
        //building
        for (let index = frames.length - 1; index >= 0; index--) {
            const itIsLastFrame = index >= frames.length - 1;
            const itIsFirstFrame = index <= 0;
            const reversedIndex = frames.length - 1 - index;
            cc.checkRestrictionAndMove(2);
            block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderFrameSelector(reversedIndex), { entityStartPos: "reverse" }));
            wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
            if (itIsLastFrame) {
                ii.addPairMember("frame decider combinator", ii.i); // вертикальный перенос сигнала кадра
                if (!isItFirstRow) { // нужно делать по два раза. чтобы ну. провод вести. но последний раз не надо.
                    ii.addPairMember("frame decider combinator", ii.i);
                }
            }
            if (!itIsFirstFrame) { // это провода налево. но левее первого кадра нету.
                wires.push([ii.i, Wire.greenOut, ii.look(2), Wire.greenOut]);
                wires.push([ii.i, Wire.redIn, ii.look(2), Wire.redIn]);
            }
            if (isItLastRow && itIsLastFrame) {
                ii.addPairMember("main clock", ii.i);
                this.sequencerStartXY = cc.xy;
            }
            cc.checkRestrictionAndMove(1);
            block.push(f.constantCombinator(ii.next(), cc.px(-1), cc.y, Dir.east, makeSignals(frames[reversedIndex]), { entityStartPos: "reverse" }));
        }
        return { entities: block, wires: wires };
    }
    makeDecoder(ii, cc) {
        let block = [];
        let wires = [];
        let arithmeticGetByte = {
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
        let arithmeticShiftByte = {
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
        let deciderCord = {
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
        //buildingd
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticGetByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(4), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(4), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(4), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(4), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticShiftByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticGetByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(3), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(3), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(3), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticShiftByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticGetByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(2), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.deciderCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, deciderCord, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(2), Wire.greenOut]);
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticShiftByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenIn]);
        cc.checkRestrictionAndMove(2);
        block.push(f.arithmeticCombinator(ii.next(), cc.px(-2), cc.y, Dir.east, arithmeticGetByte, { entityStartPos: "reverse" }));
        wires.push([ii.i, Wire.greenIn, ii.look(1), Wire.greenOut]);
        return { entities: block, wires: wires };
    }
    makeLamps(ii, cc, frames, width) {
        const block = [];
        const wires = [];
        const signalNamesRgbGroups = [];
        const keys = Object.keys(frames);
        for (let i = 0; i < keys.length; i += 3) {
            signalNamesRgbGroups.push({
                rName: keys[i] ?? "wube-logo-space-platform",
                gName: keys[i + 1] ?? "wube-logo-space-platform",
                bName: keys[i + 2] ?? "wube-logo-space-platform"
            });
        }
        cc.dx(1);
        for (let i = width - 1; i >= 0; i--) {
            const packIndex = Math.floor(i / 4);
            if (!cc.checkLampsRestriction()) {
                let look = 4; // чек дырки в соседе слева
                if (cc.checkLampsRestriction(-4)) {
                    look = 6;
                    // cc.dx(-1);
                    // continue;
                }
                if (cc.checkLampsRestriction(-2)) {
                    look = 2;
                }
                block.push(f.rgbLamp(ii.next(), cc.px(-1), cc.y, signalNamesRgbGroups[packIndex], { entityStartPos: "reverse" }));
                if (packIndex == 0) { // если коннект не к лампе
                    wires.push([ii.i, Wire.greenIn, ii.look(look), Wire.greenOut]);
                }
                else {
                    wires.push([ii.i, Wire.greenIn, ii.look(look), Wire.greenIn]);
                }
            }
            else {
                cc.dx(-1);
                // ii.next();
                // i--;
            }
        }
        return { entities: block, wires: wires };
    }
    //#endregions
    /////////////////////////////////////////
    //#region stuff functions
    gifDataToPreparedGifData(gifData) {
        const preparedGifData = {
            rows: [],
            height: gifData.height
        };
        const rowCount = gifData.height;
        const rowLenght = gifData.width;
        for (let y = 0; y < rowCount; y++) {
            preparedGifData.rows[y] = { frames: [], width: gifData.width };
            for (let f = 0; f < gifData.frames.length; f++) {
                const frameRow = gifData.frames[f].slice(y * rowLenght, (y + 1) * rowLenght);
                const frameSignals = {};
                let currentPixel = 0;
                for (let x = 0; x < rowLenght; x += 4) {
                    function pixelAdapter(channels) {
                        return {
                            r: channels[0],
                            g: channels[1],
                            b: channels[2]
                        };
                    }
                    const pixels = [
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
    packPixels(pixels) {
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
    updateFrameCount(frameCount) {
        if (this.firstFrameClipInput && this.lastFrameClipInput) {
            this.firstFrameClipInput.max = String(frameCount);
            if (+this.firstFrameClipInput.value > frameCount) {
                this.firstFrameClipInput.value = String(frameCount);
            }
            this.lastFrameClipInput.max = String(frameCount);
            if (+this.lastFrameClipInput.value > frameCount) {
                this.lastFrameClipInput.value = String(frameCount);
            }
        }
    }
}
