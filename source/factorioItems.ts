
export default class FactorioItems {
    static blueprintTitle(entities: any[]): any {
        return {
            blueprint: {
                icons: [
                    {
                        signal: {
                            name: "small-lamp"
                        },
                        index: 1
                    }
                ],
                entities: entities,
                item: "blueprint",
                version: 562949954076673
            }
        };
    }

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

}