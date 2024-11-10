import { getTypeByName } from "./allSignals.js";
function sizeAdapter(x, y, w, h, direction) {
    if (direction == Dir.north || direction == Dir.south) {
        x = x + w / 2;
        y = y + h / 2;
    }
    else {
        x = x + h / 2;
        y = y + w / 2;
    }
    return { x: x, y: y };
}
export class factorioEntities {
    static simpleLamp(index, x, y, r, g, b) {
        return {
            entity_number: index,
            name: "small-lamp",
            position: sizeAdapter(x, y, 1, 1, Dir.south),
            color: {
                r: r / 255,
                g: g / 255,
                b: b / 255,
                a: 1
            },
            always_on: true
        };
    }
    static rgbLamp(index, x, y, names) {
        return {
            entity_number: index,
            name: "small-lamp",
            position: sizeAdapter(x, y, 1, 1, Dir.south),
            control_behavior: {
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
            position: sizeAdapter(x, y, 1, 2, direction),
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
            position: sizeAdapter(x, y, 1, 2, direction),
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
            position: sizeAdapter(x, y, 1, 1, direction),
            direction: direction,
            control_behavior: { sections: { sections: signalsOrSections } },
            ...(options?.playerDescription && { player_description: options.playerDescription })
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
})(Wire || (Wire = {}));
const ololo = [[1, 2, 3, 4]];
export class CoordinateCursor {
    constructor(x, y) {
        this._x = x;
        this._y = y;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get xy() { return { x: this._x, y: this._y }; }
    setxy(x, y) {
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
        const x = this._x + number;
        this._x = x;
        return x;
    }
    dy(number) {
        const y = this._y + number;
        this._y = y;
        return y;
    }
    px(number) {
        const old = this._x;
        this._x += number;
        return old;
    }
    py(number) {
        const old = this._y;
        this._y += number;
        return old;
    }
    dxy(xy) {
        this._x += xy.x;
        this._y += xy.y;
        return { x: this._x, y: this._y };
    }
    dxycc(xy) {
        this._x += xy.x;
        this._y += xy.y;
        return this;
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
            filters: makeSignals(signals),
            active: active ?? true
        });
    });
    return sections;
}
//# sourceMappingURL=factorioEntities.js.map