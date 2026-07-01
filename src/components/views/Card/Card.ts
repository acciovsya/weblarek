import { ensureElement, pluralize } from '../../../utils/utils';
import { Component } from '../../base/Component';

export interface ICardAction {
    onClick: (event: MouseEvent) => void;
}

export interface ICard {
    title: string;
    price: number | null;
}

/**
 * Представление базового класса карточки товара.
 *
 * Содержит общий для всех карточек функционал - название и цену.
 * Самостоятельно не используется, от него наследуются
 * CardCatalog, CardPreview и CardBasket.
 */
export class Card<T> extends Component<T & ICard> {
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

    // Цена null означает "Бесценно" - такой товар нельзя купить
    set price(value: number | null) {
        this.priceElement.textContent =
            value === null
                ? 'Бесценно'
                : `${value} ${pluralize(value, 'синапс', 'синапса', 'синапсов')}`;
    }
}
