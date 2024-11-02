
export class factorioEntities {
    static simpleLamp(index: number, x: number, y: number, r: number, g: number, b: number): any {
        return {
            entity_number: index,
            name: "small-lamp",
            position: {
                x: x,
                y: y
            },
            color: {
                r: r / 255,
                g: g / 255,
                b: b / 255,
                a: 1
            },
            always_on: true
        };
    }

    static arithmeticCombinator(index: number, x: number, y: number, direction: Dir, arithmetic_conditions: any): any {
        return {
            entity_number: index,
            name: "arithmetic-combinator",
            position: {
                x: x,
                y: y
            },
            direction: direction,
            control_behavior: {
                arithmetic_conditions: arithmetic_conditions
            }
        };
    }
    static deciderCombinator(index: number, x: number, y: number, direction: Dir, decider_conditions: any): any {
        return {
            entity_number: index,
            name: "arithmetic-combinator",
            position: {
                x: x,
                y: y
            },
            direction: direction,
            control_behavior: {
                arithmetic_conditions: decider_conditions
            }
        };
    }
}


// stuff

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
    greenOut = 4
}

export type Entities = any[];

export type Wires = [Wire, Wire, Wire, Wire][];

export type entitiesAndWires = { entities: Entities, wires: Wires };

const ololo: Wires = [[1, 2, 3, 4]]

export class CoordinateCursor {
    private _x: number;
    private _y: number;

    constructor(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    get x() { return this._x; }
    get u() { return this._y; }
    get xy() { return [this._x, this._y]; }

    dx(number: number): number {
        this._x += number;
        return this._x;
    }

    dy(number: number): number {
        this._y += number;
        return this._y;
    }

    dxy(number: number): [number, number] {
        this._x += number;
        this._y += number;
        return [this._x, this._y];
    }

}

export class indexIterator {
    private _index: number;
    constructor(index: number = 1) {
        this._index = index;
    }

    get i() { return this._index; }
    next(): number {
        this._index += 1;
        return this._index;
    }
    look(number: number): number {
        return this._index + number;
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
        this.entities.push(...entities);
    }

    addWires(wire: Wires) {
        this.wires.push(...wire);
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