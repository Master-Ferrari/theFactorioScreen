function sizeAdapter(x: number, y: number, w: number, h: number, direction: Dir): {x: number, y: number} { // пу умолчанию блок смотрит вверх
    if (direction == Dir.north || direction == Dir.south) {
        x = x + w / 2;
        y = y + h / 2;
    } else {
        x = x + h / 2;
        y = y + w / 2;
    }
    return {x: x, y: y};
}



export class factorioEntities {
    static simpleLamp(index: number, x: number, y: number, r: number, g: number, b: number): any {
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

    static arithmeticCombinator(index: number, x: number, y: number, direction: Dir, arithmetic_conditions: any): any {
        return {
            entity_number: index,
            name: "arithmetic-combinator",
            position: sizeAdapter(x, y, 1, 2, direction),
            direction: direction,
            control_behavior: {
                arithmetic_conditions: arithmetic_conditions
            }
        };
    }
    static deciderCombinator(index: number, x: number, y: number, direction: Dir, decider_conditions: any): any {
        return {
            entity_number: index,
            name: "decider-combinator",
            position: sizeAdapter(x, y, 1, 2, direction),
            direction: direction,
            control_behavior: {
                decider_conditions: decider_conditions
            }
        };
    }


    static constantCombinator(index: number, x: number, y: number, direction: Dir, signalSections: Section[]): any {
        return {
            entity_number: index,
            name: "constant-combinator",
            position: sizeAdapter(x, y, 1, 1, direction),
            direction: direction,
            control_behavior: {
                sections: {
                    sections: signalSections
                }
            }
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
        const x = this._x + number;
        this._x = x;
        return x;
    }

    dy(number: number): number {
        const y = this._y + number;
        this._y = y;
        return y;
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
    shift(number: number): number {
        this._index += number;
        return this._index;
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