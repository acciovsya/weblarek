import { IProduct } from '../../types';

/**
 * Модель данных каталога товаров.
 *
 * Хранит массив всех товаров и твоар,
 * выбранный для подробного отображения
 */
export class Products {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;

  /** Сохраняет массив товаров, полученный в параметре */
  setItems(items: IProduct[]): void {
    this.items = items;
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
  }

  /** Возвращает товар, выбранный для подробного отображения */
  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }
}
