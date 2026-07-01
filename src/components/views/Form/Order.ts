import { TPayment } from '../../../types';
import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { Form } from './Form';

interface IOrderForm {
    payment: TPayment | '';
    address: string;
}

/**
 * Представление формы выбора способа оплаты и адреса доставки.
 *
 * Первый шаг оформления заказа.
 */
export class Order extends Form<IOrderForm> {
    protected cardButtonElement: HTMLButtonElement;
    protected cashButtonElement: HTMLButtonElement;
    protected addressInputElement: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.cardButtonElement = ensureElement<HTMLButtonElement>(
            'button[name=card]',
            this.container,
        );
        this.cashButtonElement = ensureElement<HTMLButtonElement>(
            'button[name=cash]',
            this.container,
        );
        this.addressInputElement = ensureElement<HTMLInputElement>(
            'input[name=address]',
            this.container,
        );

        // Кнопки оплаты - не input, поэтому уведомляем об изменении вручную
        this.cardButtonElement.addEventListener('click', () => this.emitChange('payment', 'card'));
        this.cashButtonElement.addEventListener('click', () => this.emitChange('payment', 'cash'));
    }

    // Выделяет активную кнопку оплаты модификатором button_alt-active
    set payment(value: TPayment | '') {
        this.cardButtonElement.classList.toggle('button_alt-active', value === 'card');
        this.cashButtonElement.classList.toggle('button_alt-active', value === 'cash');
    }

    // Значение поля адреса
    set address(value: string) {
        this.addressInputElement.value = value;
    }
}
