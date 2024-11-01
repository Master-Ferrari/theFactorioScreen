import "./rainbowTitle.js";
import "./themeSwitch.js";
import "./inputHandler.js";
import getMethods from "./methods.js";
import { Dropdown } from "./dropdown.js";
import CanvasManager from "./imageProcessor.js";
import InputHandler from "./inputHandler.js";

const mainControls = document.getElementById('mainControls') as HTMLButtonElement;
const canvasControls = document.getElementById('canvasControls') as HTMLButtonElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;

const blueprintOptions = document.getElementById('blueprintOptions') as HTMLButtonElement;

const methodSelect = document.getElementById('methodSelect') as HTMLElement;

const methods = getMethods(blueprintOptions);

const onMethodSelect = (index: number | null) => { }

const modeDropdown = new Dropdown({
    dropdownElement: methodSelect,
    optionsList: methods.getList(null),
    onSelectCallback: onMethodSelect,
    defaultText: "Выбор метода"
});

function visability(hide: boolean = false) {
    if (hide) {
        mainControls.style.display = 'none';
        canvasControls.style.display = 'none';
        copyButton.classList.add('hidden');
    }
    else {
        mainControls.style.display = 'grid';
        canvasControls.style.display = 'flex';
        copyButton.classList.remove('hidden');
    }
}

const canvasManager = CanvasManager.init();

function onLoad() {
    modeDropdown.updateOptions(methods.getList(canvasManager.mode));
    visability(false);
};

canvasManager.setOnLoadCallback(onLoad);

const input = new InputHandler(canvasManager);
input.addEventListeners();