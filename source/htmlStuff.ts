import { Dropdown, DropdownOption, OptionSelectCallback } from "./dropdown.js";

type inputOptions = { id: string, min: number, max: number, value: number };

export class HtmlCreator {

    static addLabel(text: string): HTMLLabelElement { // надо придумать для этой чертовщины ещё какой-то класс
        const label = document.createElement('label');
        label.className = 'control-title';
        label.textContent = text;
        label.htmlFor = 'powerPolesCheckbox';
        return label;
    }

    static createNumberInput(id: string, min: number, max: number, value: number): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inputs';
        input.id = id;
        input.min = min.toString();
        input.max = max.toString();
        input.value = value.toString();
        return input;
    }

    static addCheckbox(id: string): HTMLLabelElement {
        const toggleSwitch = document.createElement('label');
        toggleSwitch.className = 'toggle-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = true;

        const slider = document.createElement('span');
        slider.className = 'slider';

        toggleSwitch.appendChild(checkbox);
        toggleSwitch.appendChild(slider);

        return toggleSwitch;
    }

    static createControlsContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'tight3to4Controls';
        container.className = 'controls-grid';
        return container;
    }

    static createCenterContainer(): HTMLElement {
        const methodContainer = document.createElement('div');
        methodContainer.style.display = 'flex';
        methodContainer.style.height = '100%';
        methodContainer.style.flexDirection = 'column';
        methodContainer.style.justifyContent = 'flex-end';
        methodContainer.style.alignItems = 'left';
        return methodContainer;
    }

    static createButton(text: string, onClick: () => void): HTMLDivElement {
        const button = document.createElement('div');
        button.style.marginTop = "auto";
        button.classList.add('control-margin-top-2', 'custom-button');
        button.textContent = "generate blueprint!";
        return button;
    }

    static createDropdown(options: {
        optionsList: DropdownOption[],
        onSelectCallback: OptionSelectCallback,
        defaultText: string,
        selectedPrefix: string,
        id: string
    }): HTMLDivElement {

        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-select';

        const dropdown = new Dropdown({
            dropdownElement: dropdownContainer,
            optionsList: options.optionsList,
            onSelectCallback: options.onSelectCallback,
            defaultText: options.defaultText,
            selectedPrefix: options.selectedPrefix
        });

        return dropdownContainer;
    }


    static strokeText(): { element: HTMLDivElement, changeText: (text: string) => void } {

        const strokeTextContainer = document.createElement('div');
        strokeTextContainer.className = 'stroke-text-container';

        const strokeText = document.createElement('div');
        strokeText.className = 'stroke-text';
        strokeTextContainer.appendChild(strokeText);

        const fillText = document.createElement('div');
        fillText.className = 'fill-text';
        strokeTextContainer.appendChild(fillText);


        return {
            element: strokeTextContainer,
            changeText: (text: string) => {
                strokeText.textContent = text;
                fillText.textContent = text;
            }
        };
    }

    static createXYInput(x: inputOptions, y: inputOptions): HTMLDivElement {

        const offsetContainer = document.createElement('div');
        offsetContainer.className = 'resolution-inputs';

        const offsetXInput = this.createNumberInput(x.id, x.min, x.max, x.value);
        const xLabel = document.createElement('div'); xLabel.innerText = "x"; xLabel.style.margin = "0 auto";
        const offsetYInput = this.createNumberInput(y.id, y.min, y.max, y.value);

        offsetContainer.appendChild(offsetXInput);
        offsetContainer.appendChild(xLabel);
        offsetContainer.appendChild(offsetYInput);

        return offsetContainer;
    }

}