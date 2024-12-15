import { getTypeByName } from "./allSignals.js";
function sizeAdapter(x, y, w, h, direction, order) {
    if (order == "normal") {
        if (direction == Dir.north || direction == Dir.south) {
            x = x + w / 2;
            y = y + h / 2;
        }
        else {
            x = x + h / 2;
            y = y + w / 2;
        }
    }
    else {
        if (direction == Dir.north || direction == Dir.south) {
            x = x - w / 2;
            y = y + h / 2;
        }
        else {
            x = x - h / 2;
            y = y + w / 2;
        }
    }
    return { x: x, y: y };
}
export const quality = { normal: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
export var qualityEnum;
(function (qualityEnum) {
    qualityEnum[qualityEnum["normal"] = 0] = "normal";
    qualityEnum[qualityEnum["uncommon"] = 1] = "uncommon";
    qualityEnum[qualityEnum["rare"] = 2] = "rare";
    qualityEnum[qualityEnum["epic"] = 3] = "epic";
    qualityEnum[qualityEnum["legendary"] = 4] = "legendary";
})(qualityEnum || (qualityEnum = {}));
export const qualityArr = ["normal", "uncommon", "rare", "epic", "legendary"];
export const gapsSizes = [16, 18, 20, 22, 26];
export class factorioEntities {
    static simpleLamp(index, x, y, r, g, b, options) {
        return {
            entity_number: index,
            name: "small-lamp",
            position: sizeAdapter(x, y, 1, 1, Dir.south, options?.entityStartPos ?? "normal"),
            color: {
                r: r / 255,
                g: g / 255,
                b: b / 255,
                a: 1
            },
            always_on: true
        };
    }
    static rgbLamp(index, x, y, names, options) {
        return {
            entity_number: index,
            name: "small-lamp",
            position: sizeAdapter(x, y, 1, 1, Dir.south, options?.entityStartPos ?? "normal"),
            control_behavior: {
                "circuit_condition": {
                    "constant": options?.testNumber ?? 0,
                    "comparator": "<"
                },
                use_colors: true,
                red_signal: {
                    ...(getTypeByName(names.rName) && { type: "virtual" }), // это конечно нормально бы оптимизировать. лишний поиск по сигналам. индекс можно пробрасывать вместе с именем.
                    name: names.rName
                },
                green_signal: {
                    ...(getTypeByName(names.gName) && { type: "virtual" }),
                    name: names.gName
                },
                blue_signal: {
                    ...(getTypeByName(names.bName) && { type: "virtual" }),
                    name: names.bName
                },
                color_mode: 1
            },
            always_on: true
        };
    }
    static arithmeticCombinator(index, x, y, direction, arithmetic_conditions, options) {
        return {
            entity_number: index,
            name: "arithmetic-combinator",
            position: sizeAdapter(x, y, 1, 2, direction, options?.entityStartPos ?? "normal"),
            direction: direction,
            control_behavior: {
                arithmetic_conditions: arithmetic_conditions
            },
            ...(options?.playerDescription && { player_description: options.playerDescription })
        };
    }
    static deciderCombinator(index, x, y, direction, decider_conditions, options) {
        return {
            entity_number: index,
            name: "decider-combinator",
            position: sizeAdapter(x, y, 1, 2, direction, options?.entityStartPos ?? "normal"),
            direction: direction,
            control_behavior: {
                decider_conditions: decider_conditions
            },
            ...(options?.playerDescription && { player_description: options.playerDescription })
        };
    }
    static constantCombinator(index, x, y, direction, signalsOrSections, options) {
        return {
            entity_number: index,
            name: "constant-combinator",
            position: sizeAdapter(x, y, 1, 1, direction, options?.entityStartPos ?? "normal"),
            direction: direction,
            control_behavior: { sections: { sections: signalsOrSections } },
            ...(options?.playerDescription && { player_description: options.playerDescription })
        };
    }
    static substation(index, x, y, quality, options) {
        let qualityName = "normal";
        if (typeof quality === "number") {
            qualityName = qualityArr[quality] || "normal";
        }
        else {
            qualityName = quality;
        }
        console.log(quality, qualityName);
        return {
            entity_number: index,
            name: "substation",
            position: sizeAdapter(x, y, 2, 2, 1, options?.entityStartPos ?? "normal"),
            ...(qualityName != "normal" && { quality: qualityName })
        };
    }
}
export var Dir;
(function (Dir) {
    Dir[Dir["north"] = 1] = "north";
    Dir[Dir["east"] = 4] = "east";
    Dir[Dir["south"] = 8] = "south";
    Dir[Dir["west"] = 12] = "west";
})(Dir || (Dir = {}));
export var Wire;
(function (Wire) {
    Wire[Wire["redIn"] = 1] = "redIn";
    Wire[Wire["greenIn"] = 2] = "greenIn";
    Wire[Wire["redOut"] = 3] = "redOut";
    Wire[Wire["greenOut"] = 4] = "greenOut";
    Wire[Wire["coper"] = 5] = "coper";
})(Wire || (Wire = {}));
const ololo = [[1, 2, 3, 4]];
export class CoordinateCursor {
    constructor(x, y) {
        this.restrictedColumns = [];
        this.restrictedRows = [];
        this._x = x;
        this._y = y;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get xy() { return { x: this.x, y: this.y }; }
    sxy(x, y) {
        if (typeof x === 'object') {
            this._x = x.x;
            this._y = x.y;
        }
        else {
            this._x = x;
            this._y = y;
        }
    }
    dx(number) {
        const x = this.x + number;
        this._x = x;
        return x;
    }
    dy(number) {
        const y = this.y + number;
        this._y = y;
        return y;
    }
    px(number) {
        const old = this.x;
        this._x += number;
        return old;
    }
    py(number) {
        const old = this.y;
        this._x += number;
        return old;
    }
    dxy(xy) {
        this._x += xy.x;
        this._y += xy.y;
        return { x: this.x, y: this.y };
    }
    dxycc(xy) {
        this._x += xy.x;
        this._y += xy.y;
        return this;
    }
    sy(y) {
        this._y = y;
        return y;
    }
    sx(x) {
        this._x = x;
        return x;
    }
    checkRestrictionAndMove(width) {
        let magic = -5;
        if (width == 1) {
            magic = -4;
        }
        for (let w = 0; w < width; w++) {
            console.log("test3 ", this._x, this.restrictedColumns.includes(this._x + w));
            if (this.restrictedColumns.includes(this._x + w + magic)) {
                console.log("test3 ===== -1 ");
                this._x--;
                this.checkRestrictionAndMove(width);
                break;
            }
        }
    }
    checkLampsRestriction(lookX = 0, width) {
        let checkX = this._x + lookX;
        const checkY = this._y - 2;
        const newRestrictions = this.restrictedColumns.map(x => -x - 2);
        console.log("\ntest43-1", "\nвот такие у нас рестрикции:", newRestrictions, "\nширина кстати у на:", width, "\nкорректируем её на:", (-checkX), "\nа вот наша координата (this._x):", this._x, "\nа вот lookX:", lookX, "\nи проверяем вхождение", newRestrictions.includes(-checkX));
        if (width < -checkX) { // чек выхода за границу экрана
            return false;
        }
        console.log("test44", -checkX, lookX);
        // checkX = -(width ?? 0) - checkX; // расчёт относительно правого края
        return newRestrictions.includes(-checkX) && this.restrictedRows.includes(checkY);
    }
    checkLampsHole() {
        let checkX = this._x - 4; //почему тут -4 нам неизвестно
        const checkY = this._y - 2;
        return this.restrictedColumns.includes(checkX) && this.restrictedRows.includes(checkY);
    }
    addRestrictedColumns(columns) {
        for (const column of columns) {
            console.log("test4-restricted", column);
            if (!this.restrictedColumns.includes(column - 2)) {
                this.restrictedColumns.push(column - 2);
            }
        }
    }
    addRestrictedRows(rows) {
        for (const row of rows) {
            console.log("test4-restricted", row);
            if (!this.restrictedRows.includes(row - 2)) {
                this.restrictedRows.push(row - 2);
            }
        }
    }
}
export class indexIterator {
    constructor(index = 1) {
        this.pairs = {};
        this._index = index;
    }
    get i() { return this._index; }
    next() {
        this._index += 1;
        return this._index;
    }
    pnext() {
        this._index += 1;
        return this._index - 1;
    }
    look(number) {
        return this._index + number;
    }
    shift(number) {
        this._index += number;
        return this._index;
    }
    set(index) {
        this._index = index;
        return this._index;
    }
    addPairMember(key, value) {
        if (!this.pairs[key]) { // в первый раз
            this.pairs[key] = {
                pairs: [],
                incompletePairMember: value
            };
            return;
        }
        if (this.pairs[key].incompletePairMember) { // в чётный раз
            this.pairs[key].pairs.push([this.pairs[key].incompletePairMember, value]);
            this.pairs[key].incompletePairMember = null;
            return;
        }
        if (!this.pairs[key].incompletePairMember) { // в нечётный раз
            this.pairs[key].incompletePairMember = value;
            return;
        }
    }
    getpairs(key) {
        if (!this.pairs[key]) {
            return [];
        }
        return this.pairs[key].pairs;
    }
}
export class Blueprint {
    constructor(entities = [], wires = [], icons = []) {
        this.entities = entities;
        this.wires = wires ?? [];
        this.icons = icons ?? [];
    }
    addEntities(entities) {
        for (const entitie of entities) {
            this.entities.push(entitie);
        }
    }
    addWires(wires) {
        for (const wire of wires) {
            this.wires.push(wire);
        }
    }
    addEntitiesAndWires(data) {
        this.addEntities(data.entities);
        this.addWires(data.wires);
    }
    get struct() {
        return {
            blueprint: {
                icons: this.icons,
                entities: this.entities,
                wires: this.wires,
                item: "blueprint",
                version: 562949954076673
            }
        };
    }
    json() {
        return JSON.stringify(this.struct);
    }
}
export function makeSignals(signals = {}) {
    const signalJsons = [];
    let i = 1;
    return [
        {
            index: 1,
            filters: Object.keys(signals).map(key => {
                const type = getTypeByName(key);
                return {
                    index: i++,
                    ...(type && { type }),
                    quality: "normal",
                    comparator: "=",
                    name: key,
                    count: signals[key]
                };
            })
        }
    ];
}
export function makeSignalSections(sectionsData) {
    const sections = [];
    let i = 1;
    sectionsData.forEach(({ sectionName, signals, active }) => {
        sections.push({
            index: i++,
            ...(sectionName && { group: sectionName }),
            filters: signals.filters,
            active: active ?? true
        });
    });
    return sections;
}
