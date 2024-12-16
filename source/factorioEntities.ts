import { CursorPos } from "readline";
import { getTypeByName } from "./allSignals.js";

function sizeAdapter(x: number, y: number, w: number, h: number, direction: Dir, order: Order): { x: number, y: number } { // пу умолчанию блок смотрит вверх
    if (order == "normal") {
        if (direction == Dir.north || direction == Dir.south) {
            x = x + w / 2;
            y = y + h / 2;
        } else {
            x = x + h / 2;
            y = y + w / 2;
        }
    }
    else {
        if (direction == Dir.north || direction == Dir.south) {
            x = x - w / 2;
            y = y + h / 2;
        } else {
            x = x - h / 2;
            y = y + w / 2;
        }
    }
    return { x: x, y: y };
}

export type Quality = "normal" | "uncommon" | "rare" | "epic" | "legendary";
export const quality = { normal: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
export enum qualityEnum {
    normal = 0,
    uncommon = 1,
    rare = 2,
    epic = 3,
    legendary = 4
}
export const qualityArr = ["normal", "uncommon", "rare", "epic", "legendary"]
export const gapsSizes = [16, 18, 20, 22, 26];

export type RgbSignalsNames = { rName: string, gName: string, bName: string };

type Order = "normal" | "reverse";

export class factorioEntities {
    static simpleLamp(index: number, x: number, y: number, r: number, g: number, b: number, options?: { entityStartPos?: Order }): any {
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
    static rgbLamp(index: number, x: number, y: number, names: RgbSignalsNames, options?: { entityStartPos?: Order, testNumber?: number }): any {
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

    static arithmeticCombinator(index: number, x: number, y: number, direction: Dir, arithmetic_conditions: any, options?: { playerDescription?: string, entityStartPos?: Order }): any {
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
    static deciderCombinator(index: number, x: number, y: number, direction: Dir, decider_conditions: any, options?: { playerDescription?: string, entityStartPos?: Order }): any {
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


    static constantCombinator(index: number, x: number, y: number, direction: Dir, signalsOrSections: any, options?: { playerDescription?: string, entityStartPos?: Order }): any {
        return {
            entity_number: index,
            name: "constant-combinator",
            position: sizeAdapter(x, y, 1, 1, direction, options?.entityStartPos ?? "normal"),
            direction: direction,
            control_behavior: { sections: { sections: signalsOrSections } },
            ...(options?.playerDescription && { player_description: options.playerDescription })
        }
    }

    static substation(index: number, x: number, y: number, quality: Quality | qualityEnum, options?: { entityStartPos?: Order }): any {
        let qualityName: string = "normal";

        if (typeof quality === "number") {
            qualityName = qualityArr[quality] || "normal";
        } else {
            qualityName = quality;
        }

        return {
            entity_number: index,
            name: "substation",
            position: sizeAdapter(x, y, 2, 2, 1, options?.entityStartPos ?? "normal"),
            ...(qualityName != "normal" && { quality: qualityName })
        }
    }
}


// stuff

export type Filter = {
    index: number;
    type: string;
    name: string;
    quality: string;
    comparator: string;
    count: number;
    max_count?: number;
}

export type Section = {
    index: number;
    filters: Filter[];
    active?: boolean;
}

export enum Dir {
    north = 1,
    east = 4,
    south = 8,
    west = 12
}

export enum Wire {
    redIn = 1,
    greenIn = 2,
    redOut = 3,
    greenOut = 4,
    coper = 5
}

export type Entities = any[];

export type Wires = [Wire, Wire, Wire, Wire][];

export type entitiesAndWires = { entities: Entities, wires: Wires };

const ololo: Wires = [[1, 2, 3, 4]]

export class CoordinateCursor {
    private _x: number;
    private _y: number;

    restrictedColumns: number[] = [];
    restrictedRows: number[] = [];

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    get y() { return this._y; }
    get xy() { return { x: this.x, y: this.y }; }

    sxy(x: number, y: number): void;
    sxy(xy: { x: number, y: number }): void;
    sxy(x: number | { x: number, y: number }, y?: number): void {
        if (typeof x === 'object') {
            this._x = x.x;
            this._y = x.y;
        } else {
            this._x = x;
            this._y = y as number;
        }
    }

    dx(number: number): number { // delta 
        const x = this.x + number;
        this._x = x;
        return x;
    }

    dy(number: number): number { // delta 
        const y = this.y + number;
        this._y = y;
        return y;
    }

    px(number: number): (number) { // post change
        const old = this.x;
        this._x += number;
        return old;
    }

    py(number: number): (number) { // post change
        const old = this.y;
        this._x += number;
        return old;
    }

    dxy(xy: { x: number, y: number }): { x: number, y: number } {
        this._x += xy.x;
        this._y += xy.y;
        return { x: this.x, y: this.y }
    }

    dxycc(xy: { x: number, y: number }): CoordinateCursor {
        this._x += xy.x;
        this._y += xy.y;
        return this
    }

    sy(y: number): (number) {
        this._y = y;
        return y;
    }

    sx(x: number): (number) {
        this._x = x;
        return x;
    }

    checkRestrictionAndMove(width: number) {
        let magic = -5;
        if (width == 1) { magic = -4; }
        for (let w = 0; w < width; w++) {
            if (this.restrictedColumns.includes(this._x + w + magic)) {
                this._x--;
                this.checkRestrictionAndMove(width);
                break;
            }
        }
    }

    checkLampsRestriction(lookX: number = 0, width: number): boolean { //-2 +2
        let checkX = this._x + lookX;
        const checkY = this._y - 2;

        const newRestrictions = this.restrictedColumns.map(x => -x - 2);

        // console.log("\ntest43-1",
        //     "\nвот такие у нас рестрикции:", newRestrictions,
        //     "\nширина кстати у на:", width,
        //     "\nкорректируем её на:", (-checkX),
        //     "\nа вот наша координата (this._x):", this._x,
        //     "\nа вот lookX:", lookX,
        //     "\nи проверяем вхождение", newRestrictions.includes(-checkX));


        if (width < -checkX) { // чек выхода за границу экрана
            return false;
        }

        // checkX = -(width ?? 0) - checkX; // расчёт относительно правого края


        return newRestrictions.includes(-checkX) && this.restrictedRows.includes(checkY);
    }

    checkLampsHole(): boolean {
        let checkX = this._x - 4; //почему тут -4 нам неизвестно
        const checkY = this._y - 2;

        return this.restrictedColumns.includes(checkX) && this.restrictedRows.includes(checkY);
    }

    addRestrictedColumns(columns: number[]) {
        for (const column of columns) {
            if (!this.restrictedColumns.includes(column - 2)) {
                this.restrictedColumns.push(column - 2);
            }
        }
    }

    addRestrictedRows(rows: number[]) {
        for (const row of rows) {
            if (!this.restrictedRows.includes(row - 2)) {
                this.restrictedRows.push(row - 2);
            }
        }
    }
}

export class indexIterator {
    private _index: number;

    private pairs: {
        [key: string]: {
            pairs: [number, number][],
            incompletePairMember: number | null
        }
    } = {};

    constructor(index: number = 1) {
        this._index = index;
    }

    get i() { return this._index; }
    next(): number {
        this._index += 1;
        return this._index;
    }
    pnext(): number {
        this._index += 1;
        return this._index - 1;
    }
    look(number: number): number {
        return this._index + number;
    }
    shift(number: number): number {
        this._index += number;
        return this._index;
    }
    set(index: number): number {
        this._index = index;
        return this._index;
    }

    addPairMember(key: string, value: number): void {

        if (!this.pairs[key]) { // в первый раз
            this.pairs[key] = {
                pairs: [],
                incompletePairMember: value
            }
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

    getpairs(key: string): [number, number][] {
        if (!this.pairs[key]) {
            return [];
        }
        return this.pairs[key].pairs;
    }

}

export class Blueprint {
    private icons: any[];
    private entities: Entities;
    private wires: Wires;

    constructor(entities: Entities = [], wires: Wires = [], icons: any[] = []) {
        this.entities = entities;
        this.wires = wires ?? [];
        this.icons = icons ?? [];
    }

    addEntities(entities: Entities) {
        for (const entitie of entities) {
            this.entities.push(entitie);
        }
    }

    addWires(wires: Wires) {
        for (const wire of wires) {
            this.wires.push(wire);
        }
    }

    addEntitiesAndWires(data: entitiesAndWires) {
        this.addEntities(data.entities);
        this.addWires(data.wires);
    }

    get struct(): any {
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

    json(): string {
        return JSON.stringify(this.struct);
    }
}


export type Signals = { [name: string]: number };

export function makeSignals(signals: Signals = {}): any {
    const signalJsons: any = [];
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
    ]
}

export function makeSignalSections(sectionsData: { signals: Signals, active?: boolean, sectionName?: string }[]): any[] {
    const sections: any[] = [];
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