import { ensureElement, pluralize } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IBasket {
    items: HTMLElement[];
    price: number;
}

export class Basket extends Component<IBasket> {
    protected listElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        protected events: IEvents,
    ) {
        super(container);

        this.listElement = ensureElement<HTMLButtonElement>('.basket__list', this.container);
        this.priceElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        // Клик по кнопке - запрос на оформление заказа
        this.buttonElement.addEventListener('click', () => this.events.emit('order:open'));
    }

    // Список товаров либо заглушка для пустой корзины
    set items(value: HTMLElement[]) {
        this.listElement.replaceChildren(...value);
    }

    // Итоговая сумма заказа
    set price(value: number) {
        this.priceElement.textContent = `${value} ${pluralize(
            value,
            'синапс',
            'синапса',
            'синапсов',
        )}`;
    }

    // Доступность кнопки оформления - решение принимает презнтер
    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }
}
