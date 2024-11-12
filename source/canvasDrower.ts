type Operation = AddStripe;
type Direction = "left" | "right" | "top" | "bottom";

export type AddStripe = {
    type: "addStripe",
    class: CanvasOperator,
    options: AddStripeOptions
};

type AddStripeOptions = {
    direction: Direction,
    color: string | null,
    width: number
}

export class canvasDrower {
    private context: CanvasRenderingContext2D;

    operations: Operation[] = [];

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    make(operation: Operation) {
        let operator: CanvasOperator;
        if (operation.type == "addStripe") {
            operator = new AddStripeClass();
        }

        this.operations.push(operator!.log(operation.options));
    }

    render() {
        this.operations.forEach((operation) => {
            operation.class.render(operation.options, this.context);
        })
    }

}

abstract class CanvasOperator {
    constructor() { }
    abstract log(option: AddStripeOptions): Operation;
    abstract render(option: AddStripeOptions, context: CanvasRenderingContext2D): void;
}

class AddStripeClass extends CanvasOperator {
    log(options: AddStripeOptions): Operation {
        return { type: "addStripe", class: this, options: options };
    }
    render(option: AddStripeOptions, context: CanvasRenderingContext2D): void {
        const canvas = context.canvas;
        const oldWidth = canvas.width;
        const oldHeight = canvas.height;
        const stripeWidth = option.width;
        const direction = option.direction;

        // Сохраняем текущее содержимое канваса
        const imageData = context.getImageData(0, 0, oldWidth, oldHeight);

        // Определяем новые размеры канваса
        if (direction === "left" || direction === "right") {
            canvas.width = oldWidth + stripeWidth;
        } else {
            canvas.height = oldHeight + stripeWidth;
        }

        // Очищаем канвас после изменения размеров
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Вычисляем смещение для существующего содержимого
        let dx = 0;
        let dy = 0;

        if (direction === "left") {
            dx = stripeWidth;
        } else if (direction === "top") {
            dy = stripeWidth;
        }

        // Восстанавливаем существующее содержимое с учетом смещения
        context.putImageData(imageData, dx, dy);

        // Устанавливаем цвет заливки
        if (option.color) {
            context.fillStyle = option.color;
        } else {
            context.fillStyle = 'transparent';
        }

        // Заполняем новую область заданным цветом
        if (direction === "left") {
            context.fillRect(0, 0, stripeWidth, canvas.height);
        } else if (direction === "right") {
            context.fillRect(oldWidth, 0, stripeWidth, canvas.height);
        } else if (direction === "top") {
            context.fillRect(0, 0, canvas.width, stripeWidth);
        } else if (direction === "bottom") {
            context.fillRect(0, oldHeight, canvas.width, stripeWidth);
        }
    }
}
