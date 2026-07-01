import { ensureElement } from '../../../utils/utils';
import { IEvents } from '../../base/Events';
import { Form } from './Form';

interface IContactsForm {
    email: string;
    phone: string;
}

export class Contacts extends Form<IContactsForm> {
    protected emailInputElement: HTMLInputElement;
    protected phoneInputElement: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this.emailInputElement = ensureElement<HTMLInputElement>(
            'input[name=email]',
            this.container,
        );
        this.phoneInputElement = ensureElement<HTMLInputElement>(
            'input[name=phone]',
            this.container,
        );
    }

    // Значение поля email
    set email(value: string) {
        this.emailInputElement.value = value;
    }

    // Значение поля телефона
    set phone(value: string) {
        this.phoneInputElement.value = value;
    }
}
