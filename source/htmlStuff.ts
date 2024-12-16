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

    static createNumberInput(id: string, value: number, min?: number, max?: number): HTMLInputElement {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'inputs';
        input.id = id;
        if (min !== undefined) {
            input.min = min.toString();
        }
        if (max !== undefined) {
            input.max = max.toString();
        }
        input.value = value.toString();
        return input;
    }

    static addCheckbox(id: string, checked: boolean = true): { container: HTMLLabelElement, element: HTMLInputElement } {
        const toggleSwitch = document.createElement('label');
        toggleSwitch.className = 'toggle-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;

        const slider = document.createElement('span');
        slider.className = 'slider';

        toggleSwitch.appendChild(checkbox);
        toggleSwitch.appendChild(slider);

        return { container: toggleSwitch, element: checkbox };
    }

    static createControlsContainer(): HTMLElement {
        const container = document.createElement('div');
        container.id = 'tight3to4Controls';
        container.className = 'controls-grid';
        return container;
    }

    static createScrollContainer(height: number): HTMLElement {
        const container = document.createElement('div');
        container.className = 'scroll-container sex-scrollbar';
        container.style.height = `${height}px`;
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
        button.onclick = onClick;
        return button;
    }

    static createSeparator(marginBottom?: string): HTMLDivElement {
        const separator = document.createElement('div');
        separator.classList.add('separation-line');
        if (marginBottom) {
            separator.style.marginBottom = marginBottom;
        }
        return separator;
    }

    static createDropdown(options: {
        optionsList: DropdownOption[],
        onSelectCallback: OptionSelectCallback,
        defaultText: string,
        selectedPrefix: string,
        id: string
        width?: number
        parent?: HTMLElement
    }): HTMLDivElement {

        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'dropdown-select';

        const dropdown = new Dropdown({
            dropdownElement: dropdownContainer,
            optionsList: options.optionsList,
            onSelectCallback: options.onSelectCallback,
            defaultText: options.defaultText,
            selectedPrefix: options.selectedPrefix,
            width: options.width,
            parent: options.parent
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

    static createXYInput(x: inputOptions, y: inputOptions): { container: HTMLDivElement, xInput: HTMLInputElement, yInput: HTMLInputElement } {

        const offsetContainer = document.createElement('div');
        offsetContainer.className = 'resolution-inputs';

        const offsetXInput = this.createNumberInput(x.id, x.value, x.min, x.max);
        const xLabel = document.createElement('div'); xLabel.innerText = "x"; xLabel.style.margin = "0 auto";
        const offsetYInput = this.createNumberInput(y.id, y.value, y.min, y.max);

        offsetContainer.appendChild(offsetXInput);
        offsetContainer.appendChild(xLabel);
        offsetContainer.appendChild(offsetYInput);

        return { container: offsetContainer, xInput: offsetXInput, yInput: offsetYInput };
    }

    static bindFixedElementToTarget(
        targetElement: HTMLElement,
        slaveElement: HTMLElement,
        offset: { top: number; left: number },
        transferWidth: boolean = false
    ): () => void {
        // Функция для обновления позиции фиксированного элемента
        function updateFixedElementPosition() {
            const targetRect = targetElement.getBoundingClientRect();

            slaveElement.style.position = "fixed";
            slaveElement.style.top = `${targetRect.top + offset.top}px`;
            slaveElement.style.left = `${targetRect.left + offset.left}px`;

            if (transferWidth) {
                slaveElement.style.width = `${targetRect.width}px`;
            }
        }

        // Изначальное обновление позиции
        updateFixedElementPosition();

        // Обработчики для динамического обновления позиции
        window.addEventListener("scroll", updateFixedElementPosition);
        window.addEventListener("resize", updateFixedElementPosition);

        // Удаление обработчиков при удалении элемента
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.removedNodes) {
                    mutation.removedNodes.forEach((node) => {
                        if (node === targetElement || node === slaveElement) {
                            window.removeEventListener("scroll", updateFixedElementPosition);
                            window.removeEventListener("resize", updateFixedElementPosition);
                            observer.disconnect();
                        }
                    });
                }
            });
        });

        // Подключение наблюдателя
        observer.observe(document.body, { childList: true, subtree: true });

        return updateFixedElementPosition;
    }



}