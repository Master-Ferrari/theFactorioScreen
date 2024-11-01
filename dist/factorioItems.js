export default class FactorioItems {
    static blueprintTitle(entities) {
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
    static simpleLamp(index, x, y, r, g, b) {
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
//# sourceMappingURL=factorioItems.js.map