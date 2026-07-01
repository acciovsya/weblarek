import { IProduct } from '../../types';
import { Events } from '../../utils/constants';
import { IEvents } from '../base/Events';

/**
 * Модель данных корзины.
 *
 * Хранит товары, выбранные покупателем для покупки
 */
export class BasketModel {
    private items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    /** Возвращает массив товаров, которые находятся в корзине */
    getItems(): IProduct[] {
        return this.items;
    }

    /** Добавляет переданный товар в массив корзины */
    addItem(item: IProduct): void {
        this.items.push(item);
        this.events.emit(Events.BasketChanged);
    }

    /** Удаляет переданный товар из массива корзины */
    removeItem(item: IProduct): void {
        this.items = this.items.filter((product) => product.id !== item.id);
        this.events.emit(Events.BasketChanged);
    }

    /** Очищает корзину, удаляя все товары */
    clear(): void {
        this.items = [];
        this.events.emit(Events.BasketChanged);
    }

    /** Возвращает суммарную стоимость всех товаров в корзине
     * (товары с ценой `null` в расчёт не берутся). */
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    }

    /** Возвращает количество товаров в корзине */
    getCount(): number {
        return this.items.length;
    }

    /** Проверяет наличие товара в корзине по его `id`;
     * возвращает `true`, если товар присутствует. */
    hasItem(id: string): boolean {
        return this.items.some((item) => item.id === id);
    }
}
