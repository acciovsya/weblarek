import { Component } from '../base/Component';

interface IGallery {
    items: HTMLElement[];
}

/**
 * Представление каталога товаров на главной странице.
 *
 * Отображает переданный набор карточек товаров.
 */
export class Gallery extends Component<IGallery> {
    constructor(container: HTMLElement) {
        super(container);
    }

    // Полностью заменяет содержимое каталога переданными карточками
    set items(value: HTMLElement[]) {
        this.container.replaceChildren(...value);
    }
}
