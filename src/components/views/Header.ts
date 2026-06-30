import { ensureElement } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IHeader {
    counter: number;
}

export class Header extends Component<IHeader> {
    protected counterElement: HTMLElement;
    protected basketButtonElement: HTMLButtonElement;

    constructor(
        protected events: IEvents,
        container: HTMLElement,
    ) {
        super(container);

        this.counterElement = ensureElement<HTMLElement>('.header__basket-counter', this.container);
        this.basketButtonElement = ensureElement<HTMLButtonElement>(
            '.header__basket',
            this.container,
        );

        // Клик по кнопке корзины - запрос на открытие корзины
        this.basketButtonElement.addEventListener('click', () => {
            this.events.emit(`basket:open`);
        });
    }

    // Число товаров в счётчике корзины
    set counter(value: number) {
        this.counterElement.textContent = String(value);
    }
}
