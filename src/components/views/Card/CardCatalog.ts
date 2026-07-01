import { IProduct } from '../../../types';
import { categoryMap } from '../../../utils/constants';
import { ensureElement } from '../../../utils/utils';
import { Card, ICardAction } from './Card';

export type TCardCatalog = Pick<IProduct, 'image' | 'category'>;
type CategoryKey = keyof typeof categoryMap;

/**
 * Представление карточки товара в каталоге.
 *
 * Отображает категорию, изображение, название и цену.
 * По клику сообщает о выборе товара для подробного просмотра.
 */
export class CardCatalog extends Card<TCardCatalog> {
    protected categoryElement: HTMLElement;
    protected imageElement: HTMLImageElement;

    constructor(container: HTMLElement, actions?: ICardAction) {
        super(container);

        this.categoryElement = ensureElement<HTMLElement>('.card__category', this.container);
        this.imageElement = ensureElement<HTMLImageElement>('.card__image', this.container);

        if (actions?.onClick) {
            this.container.addEventListener('click', actions.onClick);
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
}
