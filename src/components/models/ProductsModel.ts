import { IProduct } from '../../types';
import { Events } from '../../utils/constants';
import { IEvents } from '../base/Events';

/**
 * Модель данных каталога товаров.
 *
 * Хранит массив всех товаров и твоар,
 * выбранный для подробного отображения
 */
export class ProductsModel {
    private items: IProduct[] = [];
    private selectedItem: IProduct | null = null;

    constructor(protected events: IEvents) {}

    /** Сохраняет массив товаров, полученный в параметре */
    setItems(items: IProduct[]): void {
        this.items = items;
        this.events.emit(Events.CatalogChanged);
    }

    /** Возвращает массив всех товаров */
    getItems(): IProduct[] {
        return this.items;
    }

    /** Возвращает один товар по его id или undefined, если товар не найден */
    getItem(id: string): IProduct | undefined {
        return this.items.find((item) => item.id === id);
    }

    /** Сохраняет товар для подробного отображения */
    setSelectedItem(item: IProduct): void {
        this.selectedItem = item;
        this.events.emit(Events.PreviewChanged);
    }

    /** Возвращает товар, выбранный для подробного отображения */
    getSelectedItem(): IProduct | null {
        return this.selectedItem;
    }
}
