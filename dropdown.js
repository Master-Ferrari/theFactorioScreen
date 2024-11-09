export class Dropdown {
    constructor(opt) {
        this.dropdown = opt.dropdownElement;
        this.optionsList = opt.optionsList;
        this.isOpen = false;
        this.selectedOption = null;
        this.onSelectCallback = opt.onSelectCallback;
        this.defaultText = opt.defaultText;
        this.selectedPrefix = opt.selectedPrefix ?? "";
        this.dropdownTrigger = this.createDropdownTrigger();
        this.dropdownOptions = this.createDropdownOptions();
        this.dropdown.appendChild(this.dropdownTrigger);
        this.dropdown.appendChild(this.dropdownOptions);
        this.dropdownTrigger.addEventListener('mousedown', () => this.toggleOptions());
        document.addEventListener('mousedown', (event) => this.handleOutsideClick(event));
    }
    updateOptions(newOptions) {
        this.optionsList.forEach((option, index) => {
            this.selectedOption = null;
            this.onSelectCallback(null);
            const element = this.dropdownOptions.querySelector(this.generateId(option.name));
            element?.removeEventListener('mouseup', () => this.selectOption(option, index));
            element?.remove();
        });
        this.dropdownOptions.remove();
        this.optionsList = newOptions;
        this.dropdownOptions = this.createDropdownOptions();
        this.dropdown.appendChild(this.dropdownOptions);
    }
    generateId(name) {
        return `dropdown-option-${name}`;
    }
    createDropdownTrigger() {
        const trigger = document.createElement('button');
        trigger.classList.add('dropdown-select-trigger');
        trigger.classList.add('custom-button');
        // trigger.classList.add('dropdown-select-trigger');
        trigger.innerText = this.defaultText;
        return trigger;
    }
    createDropdownOptions() {
        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('dropdown-options');
        optionsContainer.style.display = 'none';
        this.optionsList.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.id = this.generateId(option.name);
            optionElement.innerText = option.value;
            if (option.isActive) {
                optionElement.classList.add('dropdown-option');
                optionElement.addEventListener('mouseup', () => {
                    this.selectOption(option, index);
                });
            }
            else {
                optionElement.classList.add('dropdown-option-deactivated');
            }
            optionsContainer.appendChild(optionElement);
        });
        // this.dropdown.appendChild(optionsContainer);
        return optionsContainer;
    }
    openOptions() {
        this.dropdownOptions.style.display = 'block';
        this.isOpen = true;
    }
    closeOptions() {
        this.dropdownOptions.style.display = 'none';
        this.isOpen = false;
    }
    toggleOptions() {
        if (this.isOpen) {
            this.closeOptions();
        }
        else {
            this.openOptions();
        }
    }
    selectOption(option, index) {
        this.dropdownTrigger.innerText = this.selectedPrefix + option.value;
        this.selectedOption = index;
        this.onSelectCallback(index);
        this.closeOptions();
    }
    handleOutsideClick(event) {
        if (this.isOpen && !this.dropdown.contains(event.target)) {
            this.closeOptions();
        }
    }
}
//# sourceMappingURL=dropdown.js.map