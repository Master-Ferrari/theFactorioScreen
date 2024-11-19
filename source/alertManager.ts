export type AlertType = "toMuch" | "wrongXOffset" | "fileError";

export class AlertManager {
    private static instance: AlertManager | null = null;

    public static getInstance(): AlertManager {
        if (!this.instance) {
            this.instance = new AlertManager();
        }
        return this.instance;
    }

    private alertTexts: Record<AlertType, string> = {
        toMuch: "the image is too wide.",
        wrongXOffset: "the substation interferes with screen connection. adjust the X offset.",
        fileError: "it would have to be png, gif or png sequence."
    };

    private activeAlerts: Record<AlertType, boolean> = {
        toMuch: false,
        wrongXOffset: false,
        fileError: false
    };

    private alertElement: HTMLElement;

    private constructor() {
        const element = document.getElementById('alert');
        if (!element) {
            throw new Error('Element with id "alert" not found');
        }
        this.alertElement = element;
    }

    public setAlert(key: AlertType, value: boolean): void {
        if (!(key in this.alertTexts)) return;
        this.activeAlerts[key] = value;
        this.updateAlert();
    }

    private updateAlert(): void {
        for (const key in this.alertTexts) {
            if (this.activeAlerts[key as AlertType]) {
                this.alertElement.textContent = this.alertTexts[key as AlertType];
                this.alertElement.style.display = 'block';
                return;
            }
        }
        this.alertElement.style.display = 'none';
    }
}
