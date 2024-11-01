import "./rainbowTitle.js";
import "./themeSwitch.js";
import "./inputHandler.js";
import getMethods from "./methods.js";
import { Dropdown } from "./dropdown.js";
import CanvasManager from "./imageProcessor.js";
import InputHandler from "./inputHandler.js";
const mainControls = document.getElementById('mainControls');
const canvasControls = document.getElementById('canvasControls');
const copyButton = document.getElementById('copyButton');
const blueprintOptions = document.getElementById('blueprintOptions');
const methodSelect = document.getElementById('methodSelect');
const textOutput = document.getElementById('textOutput');
function onBlueprint(text) {
    textOutput.innerText = text;
}
const methods = getMethods(blueprintOptions, onBlueprint);
const onMethodSelect = (index) => {
    if (index === null) {
        return;
    }
    const method = methods.getById(index);
    if (method === null) {
        return;
    }
    method.init();
};
const modeDropdown = new Dropdown({
    dropdownElement: methodSelect,
    optionsList: methods.getList(null),
    onSelectCallback: onMethodSelect,
    defaultText: "Выбор метода",
    selectedPrefix: "selected: "
});
function visability(hide = false) {
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
}
;
canvasManager.setOnLoadCallback(onLoad);
const input = new InputHandler(canvasManager);
input.addEventListeners();
//# sourceMappingURL=index.js.map