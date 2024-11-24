export class AlertManager {
    static getInstance() {
        if (!this.instance) {
            this.instance = new AlertManager();
        }
        return this.instance;
    }
    constructor() {
        this.alertTexts = {
            toMuch: "the image is too wide.",
            wrongXOffset: "the substation interferes with screen connection. adjust the X offset.",
            fileError: "it would have to be png, gif or png sequence.",
            wrongSequence: "all images in sequence have to be the same size."
        };
        this.activeAlerts = {
            toMuch: false,
            wrongXOffset: false,
            fileError: false,
            wrongSequence: false
        };
        const element = document.getElementById('alert');
        if (!element) {
            throw new Error('Element with id "alert" not found');
        }
        this.alertElement = element;
    }
    setAlert(key, value) {
        if (!(key in this.alertTexts))
            return;
        this.activeAlerts[key] = value;
        this.updateAlert();
    }
    updateAlert() {
        for (const key in this.alertTexts) {
            if (this.activeAlerts[key]) {
                this.alertElement.textContent = this.alertTexts[key];
                this.alertElement.style.display = 'block';
                return;
            }
        }
        this.alertElement.style.display = 'none';
    }
}
AlertManager.instance = null;
