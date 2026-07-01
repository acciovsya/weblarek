import { IProduct } from '../../../types';
import { categoryMap } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';
import { Card, ICardAction } from './Card';

export type TCardPreview = Pick<IProduct, 'image' | 'category' | 'description'>;
type CategoryKey = keyof typeof categoryMap;

/**
 * Представление товара в окне подробного просмотра.
 *
 * Дополнительно отображает описание и кнопку добавления/удаления
 * товара из корзины.
 */
export class CardPreview extends Card<TCardPreview> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;
    protected descriptionElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(container: HTMLElement, actions?: ICardAction) {
        super(container);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.descriptionElement = ensureElement<HTMLElement>('.card__text', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.card__button', this.container);

        if (actions?.onClick) {
            this.buttonElement.addEventListener('click', actions.onClick);
        }
    }

    // Переопределяем, чтобы выставить alt в момент установки заголовка:
    // так alt не зависит от порядка присвоения полей в render
    override set title(value: string) {
        super.title = value;
        this.imageElement.alt = value;
    }

    // Текст категории + цветовой модификатор фона из categoryMap
    set category(value: string) {
        this.categoryElement.textContent = value;

        for (const key in categoryMap) {
            this.categoryElement.classList.toggle(categoryMap[key as CategoryKey], key === value);
        }
    }

    // value приходит готовым URL - расширение и CDN подготавливает презентер
    set image(value: string) {
        this.setImage(this.imageElement, value);
    }

    // Подробное описание товара
    set description(value: string) {
        this.descriptionElement.textContent = value;
    }

    // Текст кнопки- зависит от того, находится ли товар в корзине и наличия цены
    set buttonText(value: string) {
        this.buttonElement.textContent = value;
    }

    // Блокирует кнопку, когда товар нельзя купить (например, цена null)
    set buttonDisabled(value: boolean) {
        this.buttonElement.disabled = value;
    }
}
