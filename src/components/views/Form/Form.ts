import { ensureElement } from '../../../utils/utils';
import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';

/**
 * Базовый класс форм. Управляет доступностью кнопки отправки и текстом
 * ошибок валидации, а также уведомляет о вводе и отправке через брокер.
 * Конкретные поля добавляют дочерние классы Order и Contacts.
 */
export class Form<T> extends Component<T> {
    protected submitButtonElement: HTMLButtonElement;
    protected errorsElement: HTMLElement;
    protected formName: string;

    constructor(
        container: HTMLFormElement,
        protected events: IEvents,
    ) {
        super(container);

        this.formName = container.name;
        this.submitButtonElement = ensureElement<HTMLButtonElement>(
            'button[type=submit]',
            this.container,
        );
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        // Изменение любого текстового поля формы
        this.container.addEventListener('input', (event) => {
            const target = event.target as HTMLInputElement;
            this.emitChange(target.name, target.value);
        });

        // Отправка формы
        this.container.addEventListener('submit', (event) => {
            event.preventDefault();
            this.events.emit(`${this.formName}:submit`);
        });
    }

    // Уведомляет презентер об изменении поля формы
    protected emitChange(field: string, value: string): void {
        this.events.emit(`${this.formName}:change`, { field, value });
    }

    // Доступность кнопки отправки (валидность формы)
    set valid(value: boolean) {
        this.submitButtonElement.disabled = !value;
    }

    // Текст ошибки валидации
    set errors(value: string) {
        this.errorsElement.textContent = value;
    }
}
