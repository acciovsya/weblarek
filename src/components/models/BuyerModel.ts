import { IBuyer, TBuyerErrors, TPayment } from '../../types';

/**
 * Модель данных покупателя.
 *
 * Хранит данные, указанные при оформлении заказа,
 * и выполняет их валидацию
 */
export class BuyerModel {
    private payment: TPayment | '' = '';
    private address: string = '';
    private email: string = '';
    private phone: string = '';

    /**
     * Сохраняет переданные поля, не затирая остальные.
     * Можно передать как все поля, так и одно (например, только address).
     */
    setData(data: Partial<IBuyer>): void {
        if (data.payment !== undefined) this.payment = data.payment;
        if (data.address !== undefined) this.address = data.address;
        if (data.email !== undefined) this.email = data.email;
        if (data.phone !== undefined) this.phone = data.phone;
    }

    /** Возвращает все данные покупателя одним объектом */
    getData(): IBuyer {
        return {
            payment: this.payment,
            address: this.address,
            email: this.email,
            phone: this.phone,
        };
    }

    /** Очищает все данные покупателя */
    clear(): void {
        this.payment = '';
        this.address = '';
        this.email = '';
        this.phone = '';
    }

    /**
     * Проверяет данные покупателя- поле считается валидным, если оно не пустое.
     * Если объект пуст, все данные корректны.
     * @returns объект с ошибками: ключ - невалидное поле, значение - текст ошибки
     */
    validate(): TBuyerErrors {
        const errors: TBuyerErrors = {};

        if (!this.payment) errors.payment = 'Не выбран вид оплаты';
        if (!this.address.trim()) errors.address = 'Укажите адрес доставки';
        if (!this.email.trim()) errors.email = 'Укажите email';
        if (!this.phone.trim()) errors.phone = 'Укажите телефон';

        return errors;
    }
}
