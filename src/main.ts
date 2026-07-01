import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { ProductsModel } from './components/models/ProductsModel';
import { BasketModel } from './components/models/BasketModel';
import { BuyerModel } from './components/models/BuyerModel';
import { CardBasket } from './components/views/Card/CardBasket';
import { CardCatalog } from './components/views/Card/CardCatalog';
import { CardPreview } from './components/views/Card/CardPreview';
import { Header } from './components/views/Header';
import { Gallery } from './components/views/Gallery';
import { Modal } from './components/views/Modal';
import { Basket } from './components/views/Basket';
import { Order } from './components/views/Form/Order';
import { Contacts } from './components/views/Form/Contacts';
import { Success } from './components/views/Success';
import { WebLarekApi } from './components/WebLarekApi';
import { IBuyer, IProduct } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, resolveImageUrl } from './utils/utils';

import './scss/styles.scss';

const events = new EventEmitter();

// Модели
const productsModel = new ProductsModel(events);
const basketModel = new BasketModel(events);
const buyerModel = new BuyerModel(events);

// Слой коммуникации
const baseApi = new Api(API_URL);
const api = new WebLarekApi(baseApi);

// Представления
const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);
const order = new Order(cloneTemplate<HTMLFormElement>('#order'), events);
const contacts = new Contacts(cloneTemplate<HTMLFormElement>('#contacts'), events);
const success = new Success(cloneTemplate<HTMLElement>('#success'), events);

// Открытое превью
let preview: CardPreview | null = null;

// Состояние кнопки превью: недоступно/ удалить / купить
function renderPreviewButton(item: IProduct): void {
    if (!preview) return;

    if (item.price === null) {
        preview.buttonText = 'Недоступно';
        preview.buttonDisabled = true;
    } else if (basketModel.hasItem(item.id)) {
        preview.buttonText = 'Удалить из корзины';
        preview.buttonDisabled = false;
    } else {
        preview.buttonText = 'Купить';
        preview.buttonDisabled = false;
    }
}

// Валидация и ошибки форм по данным покупателя
function renderFormState() {
    const data = buyerModel.getData();
    const errors = buyerModel.validate();

    order.payment = data.payment;
    const orderError = errors.payment ?? errors.address ?? '';
    order.valid = !orderError;
    order.errors = orderError;

    const contactsError = errors.email ?? errors.phone ?? '';
    contacts.valid = !contactsError;
    contacts.errors = contactsError;
}

// ==== ОБработчики событий моделей ==== //

// Загрузка / изменение каталога
events.on('catalog:changed', () => {
    gallery.items = productsModel.getItems().map((item) => {
        const card = new CardCatalog(cloneTemplate('#card-catalog'), {
            onClick: () => events.emit('card:select', { id: item.id }),
        });

        return card.render({ ...item, image: resolveImageUrl(item.image, CDN_URL) });
    });
});

// Выбран товар для подробного осмотра
events.on('preview:changed', () => {
    const item = productsModel.getSelectedItem();
    if (!item) return;

    preview = new CardPreview(cloneTemplate('#card-preview'), {
        onClick: () => {
            if (basketModel.hasItem(item.id)) {
                events.emit('basket:remove', { id: item.id });
            } else {
                events.emit('card:add', { id: item.id });
            }
        },
    });

    const node = preview.render({ ...item, image: resolveImageUrl(item.image, CDN_URL) });
    renderPreviewButton(item);

    modal.content = node;
    modal.open();
});

// Изменение корзины
events.on('basket:changed', () => {
    header.counter = basketModel.getCount();

    basket.items = basketModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate('#card-basket'), {
            onClick: () => events.emit('basket:remove', { id: item.id }),
        });

        return card.render({ ...item, index: index + 1 });
    });

    basket.price = basketModel.getTotalPrice();
    basket.buttonDisabled = basketModel.getCount() === 0;

    // Если открыто превью - пересчитываем состояние его кнопки
    const selected = productsModel.getSelectedItem();
    if (preview && selected) {
        renderPreviewButton(selected);
    }
});

// Изменение данных покупателя
events.on('buyer:changed', () => {
    renderFormState();
});

// ==== Обработчики событий представлений ==== //

events.on('card:select', ({ id }: { id: string }) => {
    const item = productsModel.getItem(id);
    if (item) {
        productsModel.setSelectedItem(item);
    }
});

events.on('card:add', ({ id }: { id: string }) => {
    const item = productsModel.getItem(id);
    if (item) {
        basketModel.addItem(item);
    }
});

events.on('basket:remove', ({ id }: { id: string }) => {
    const item = basketModel.getItems().find((product) => product.id === id);
    if (item) {
        basketModel.removeItem(item);
    }
});

events.on('basket:open', () => {
    preview = null;
    modal.content = basket.render();
    modal.open();
});

// Отркытие первой формы (способ оплаты + адрес)
events.on('order:open', () => {
    preview = null;
    order.address = buyerModel.getData().address;
    modal.content = order.render();
    renderFormState();
    modal.open();
});

// Изменение полей заказа (оплата, адрес) и контактов (email, телефон)
events.on('order:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setData({ [field]: value } as Partial<IBuyer>);
});

events.on('contacts:change', ({ field, value }: { field: keyof IBuyer; value: string }) => {
    buyerModel.setData({ [field]: value } as Partial<IBuyer>);
});

// Переход ко второй форме (контакты)
events.on('order:submit', () => {
    const data = buyerModel.getData();
    contacts.email = data.email;
    contacts.phone = data.phone;
    modal.content = contacts.render();
    renderFormState();
});

// Завершение оформление (отправка заказа на сервер)
events.on('contacts:submit', () => {
    api.orderProducts({
        ...buyerModel.getData(),
        total: basketModel.getTotalPrice(),
        items: basketModel.getItems().map((item) => item.id),
    })
        .then((result) => {
            success.total = result.total;
            modal.content = success.render();

            basketModel.clear();
            buyerModel.clear();
            order.address = '';
            contacts.email = '';
            contacts.phone = '';
        })
        .catch((error) => {
            console.error('Ошиька оформления заказа:', error);
        });
});

// Оформление заказа
events.on('success:close', () => {
    modal.close();
});

// Сброс ссылки на превью при закрытии окна
events.on('modal:close', () => {
    preview = null;
});

// ### ИНИЦИАЛИЗАЦИЯ ### //

header.counter = 0;
basket.items = [];
basket.price = 0;
basket.buttonDisabled = true;

api.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки каталога:', error);
    });
