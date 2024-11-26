type Direction = "left" | "right" | "top" | "bottom";

type AddStripeOptions = {
    direction: Direction,
    color: string, // Теперь может быть null для прозрачности
    width: number
    lenght?: number
    offsetFrom?: "start" | "end"
    offset?: number
}

export class CanvasDrawer {
    private context: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
    }

    clear() {
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    addStripe(options: AddStripeOptions): void {
        const canvas = this.context.canvas;

        const oldWidth = canvas.width;
        const oldHeight = canvas.height;

        const stripeWidth = options.width;
        const direction = options.direction;


        // Сохраняем текущее содержимое канваса
        const imageData = this.context.getImageData(0, 0, oldWidth, oldHeight);

        // Определяем новые размеры канваса
        if (direction === "left" || direction === "right") {
            canvas.width = oldWidth + stripeWidth;
        } else {
            canvas.height = oldHeight + stripeWidth;
        }

        // Очищаем канвас после изменения размеров
        this.context.clearRect(0, 0, canvas.width, canvas.height);

        // Вычисляем смещение для существующего содержимого
        let dx = 0;
        let dy = 0;

        if (direction === "left") {
            dx = stripeWidth;
        } else if (direction === "top") {
            dy = stripeWidth;
        }

        // Восстанавливаем существующее содержимое с учетом смещения
        this.context.putImageData(imageData, dx, dy);

        // // Устанавливаем цвет заливки или оставляем прозрачный, если color = null
        // if (options.color !== null) {
            this.context.fillStyle = options.color;
        // } else {
        //     this.context.fillStyle = 'rgba(0, 0, 0, 0)'; // Прозрачный цвет
        // }

        const lenghtOrZero = options.lenght ?? 0;
        const lenghtOrNull = options.lenght;
        const start = (options.offsetFrom ?? "start") == "start";
        const offset = options.offset ?? 0;

        // console.log("start ? offset : canvas.height - lenght - offset", start ? offset : canvas.height - lenghtOrNull - offset);
        // Заполняем новую область заданным цветом
        if (direction === "left") {
            this.context.fillRect(
                0, start ? offset : canvas.height - lenghtOrZero - offset,
                stripeWidth, lenghtOrNull ?? canvas.height
            );
        } else if (direction === "right") {
            this.context.fillRect(
                oldWidth, start ? offset : canvas.height - lenghtOrZero - offset,
                stripeWidth, lenghtOrNull ?? canvas.height
            );
        } else if (direction === "top") {
            this.context.fillRect(
                start ? offset : canvas.width - lenghtOrZero - offset, 0,
                lenghtOrNull ?? canvas.width, stripeWidth
            );
        } else if (direction === "bottom") {
            this.context.fillRect(
                start ? offset : canvas.width - lenghtOrZero - offset, oldHeight,
                lenghtOrNull ?? canvas.width, stripeWidth
            );
        }

    }

    drawSquare(x: number, y: number, width: number, height: number, color: string){
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    clearSquare(x: number, y: number, width: number, height: number){
        this.context.clearRect(x, y, width, height);
    }
}
