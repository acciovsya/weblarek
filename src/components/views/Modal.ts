import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IModal {
    content: HTMLElement;
}

export class Modal extends Component<IModal> {
    protected closeButtonElement: HTMLButtonElement;
    protected contentElement: HTMLElement;

    constructor(
        container: HTMLElement,
        protected events: IEvents,
    ) {
        super(container);

        this.closeButtonElement = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);

        this.closeButtonElement.addEventListener('click', () => this.close());

        // Закрытие по клику на подложку
        this.container.addEventListener('mousedown', (event) => {
            if (event.target === this.container) {
                this.close();
            }
        });
    }

    // Помещает в окно содержимое - корень любого самостоятельного компонента
    set content(value: HTMLElement) {
        this.contentElement.replaceChildren(value);
    }

    // Открывает окно и уведомляет презентер
    open(): void {
        this.container.classList.add('modal_active');
    }

    // Закрывает окно, очищает содержимое и уведомляет презентер
    close(): void {
        this.container.classList.remove('modal_active');
        this.contentElement.replaceChildren();
        this.events.emit('modal:close');
    }
}
