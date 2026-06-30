import { ensureElement } from '../../../utils/utils';
import { Card, ICardAction } from './Card';

export class CardBasket extends Card<object> {
    protected indexElement: HTMLElement;
    protected deleteButtonElement: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardAction) {
        super(container);

        this.indexElement = ensureElement<HTMLElement>('.basket__item-index', this.container);
        this.deleteButtonElement = ensureElement<HTMLButtonElement>(
            '.basket__item-delete',
            this.container,
        );

        if (actions?.onClick) {
            this.deleteButtonElement.addEventListener('click', actions.onClick);
        }
    }

    // Порядковый номер позиции в списке корзины
    set index(value: number) {
        this.indexElement.textContent = String(value);
    }
}
