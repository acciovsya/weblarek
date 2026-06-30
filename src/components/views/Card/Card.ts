import { ensureElement, pluralize } from '../../../utils/utils';
import { Component } from '../../base/Component';

export interface ICardAction {
    onClick: (event: MouseEvent) => void;
}

export class Card<T> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);

        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    }

    // Название товара
    set title(value: string) {
        this.titleElement.textContent = value;
    }

    // Цена null означает «Бесценно» - такой товар нельзя купить
    set price(value: number | null) {
        this.priceElement.textContent =
            value === null
                ? 'Бесценно'
                : `${value} ${pluralize(value, 'синапс', 'синапса', 'синапсов')}`;
    }
}
