import { ensureElement, pluralize } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface ISuccess {
    total: number;
}

export class Success extends Component<ISuccess> {
    protected descriptionElement: HTMLElement;
    protected closeButtonElement: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        protected events: IEvents,
    ) {
        super(container);

        this.descriptionElement = ensureElement<HTMLElement>(
            '.order-success__description',
            this.container,
        );
        this.closeButtonElement = ensureElement<HTMLButtonElement>(
            '.order-success__close',
            this.container,
        );

        // Клик по кнопке закрывает модальное окно
        this.closeButtonElement.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    // Сумма, списанная при оформлении заказа
    set total(value: number) {
        this.descriptionElement.textContent = `Списано ${value} ${pluralize(
            value,
            'синапс',
            'синапса',
            'синапсов',
        )}`;
    }
}
