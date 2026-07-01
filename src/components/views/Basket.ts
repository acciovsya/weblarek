import { Events } from '../../utils/constants';
import { ensureElement, pluralize } from '../../utils/utils';
import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface IBasket {
    items: HTMLElement[];
    price: number;
}

/**
 * Представление корзины.
 *
 * Отображает список выбранных товаров, итоговую сумму
 * и кнопку перехода к оформлению заказа.
 */
export class Basket extends Component<IBasket> {
    protected listElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(
        container: HTMLElement,
        protected events: IEvents,
    ) {
        super(container);

        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.priceElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        // Клик по кнопке - запрос на оформление заказа
        this.buttonElement.addEventListener('click', () => this.events.emit(Events.OrderOpen));
    }

    // Заполняет список карточкками товаров
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
