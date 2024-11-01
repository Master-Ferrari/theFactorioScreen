export type DropdownOption = { // стило бы сделат словарём
    name: string;
    value: string;
    isActive: boolean;
};

type OptionSelectCallback = (index: number | null) => void;

export class Dropdown {
    private dropdown: HTMLElement;
    private dropdownTrigger: HTMLButtonElement;
    private dropdownOptions: HTMLDivElement;
    private optionsList: DropdownOption[];
    private isOpen: boolean;
    private selectedOption: number | null;
    private onSelectCallback: OptionSelectCallback;
    private defaultText: string;

    constructor(opt: options) {
        this.dropdown = opt.dropdownElement;
        this.optionsList = opt.optionsList;
        this.isOpen = false;
        this.selectedOption = null;
        this.onSelectCallback = opt.onSelectCallback;
        this.defaultText = opt.defaultText;

        // Инициализация и создание элементов
        this.dropdownTrigger = this.createDropdownTrigger();
        this.dropdownOptions = this.createDropdownOptions();
        this.dropdown.appendChild(this.dropdownTrigger);
        this.dropdown.appendChild(this.dropdownOptions);

        // Обработчик событий
        this.dropdownTrigger.addEventListener('mousedown', () => this.toggleOptions());
        document.addEventListener('mousedown', (event) => this.handleOutsideClick(event));
    }

    updateOptions(newOptions: DropdownOption[]): void {
        this.optionsList.forEach((option, index) => {
            this.selectedOption = null;
            this.onSelectCallback(null);
            const element = this.dropdownOptions.querySelector(this.generateId(option.name));
            element?.removeEventListener('mouseup', () => this.selectOption(option, index));
            element?.remove();
        });
        this.optionsList = newOptions;
        this.createDropdownOptions();
    }

    private generateId(name: string): string {
        return `dropdown-option-${name}`;
    }

    private createDropdownTrigger(): HTMLButtonElement {
        const trigger = document.createElement('button');
        trigger.classList.add('dropdown-select-trigger');
        trigger.classList.add('custom-button');

        // trigger.classList.add('dropdown-select-trigger');
        trigger.innerText = this.defaultText;
        return trigger;
    }

    private createDropdownOptions(): HTMLDivElement {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('dropdown-options');
        optionsContainer.style.display = 'none';

        this.optionsList.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.id = `dropdown-option-${option.name + 1}`;
            optionElement.innerText = option.value;
            if (option.isActive) {
                optionElement.classList.add('dropdown-option');
                optionElement.addEventListener('mouseup', () => {
                    this.selectOption(option, index);
                });
            } else {
                optionElement.classList.add('dropdown-option-deactivated');
            }
            optionsContainer.appendChild(optionElement);
        });

        return optionsContainer;
    }

    private openOptions(): void {
        this.dropdownOptions.style.display = 'block';
        this.isOpen = true;
        console.log('Открыто');
    }

    private closeOptions(): void {
        this.dropdownOptions.style.display = 'none';
        this.isOpen = false;
        console.log('Закрыто');
    }

    private toggleOptions(): void {
        if (this.isOpen) {
            this.closeOptions();
        } else {
            this.openOptions();
        }
    }

    private selectOption(option: DropdownOption, index: number): void {
        this.dropdownTrigger.innerText = option.value;
        this.selectedOption = index;
        this.onSelectCallback(index); // Вызов колбэка с индексом выбранной опции
        this.closeOptions();
    }

    private handleOutsideClick(event: MouseEvent): void {
        if (this.isOpen && !this.dropdown.contains(event.target as Node)) {
            this.closeOptions();
        }
    }
}

type options = {
    dropdownElement: HTMLElement, optionsList: DropdownOption[], onSelectCallback: OptionSelectCallback, defaultText: string
}

// Функция инициализации компонента
// export function initializeDropdown({ dropdownElement, optionsList, onSelectCallback, defaultText }: options): Dropdown {
    // return new Dropdown({ dropdownElement, optionsList, onSelectCallback, defaultText });
// }

// // Пример вызова
// const optionsList: Option[] = [
//     { name: 'Опция 1', isActive: true },
//     { name: 'Опция 2', isActive: true },
//     { name: 'Опция 3', isActive: true }
// ];
// const dropdownElement = document.getElementById('dropdown') as HTMLElement;

// // Колбэк, который будет вызван при выборе опции
// const onSelectCallback = (index: number) => {
//     console.log(`Выбрана опция с индексом: ${index}`);
// };

// initializeCustomDropdown(dropdownElement, optionsList, onSelectCallback);
