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
import { API_URL, CDN_URL, Events } from './utils/constants';
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
const preview = new CardPreview(cloneTemplate<HTMLElement>('#card-preview'), {
    onClick: () => events.emit(Events.PreviewToggle),
});

/**  Состояние кнопки превью: недоступно/ удалить / купить */
function renderPreviewButton(item: IProduct): void {
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

/**  Валидация и ошибки форм по данным покупателя */
function renderFormState(): void {
    const data = buyerModel.getData();
    const errors = buyerModel.validate();

    order.payment = data.payment;
    order.address = data.address;
    contacts.email = data.email;
    contacts.phone = data.phone;

    const orderError = errors.payment ?? errors.address ?? '';
    order.valid = !orderError;
    order.errors = orderError;

    const contactsError = errors.email ?? errors.phone ?? '';
    contacts.valid = !contactsError;
    contacts.errors = contactsError;
}

/**  Собирает карточку каталога с обработчиком выбора */
function catalogCard(item: IProduct): HTMLElement {
    const card = new CardCatalog(cloneTemplate('#card-catalog'), {
        onClick: () => events.emit(Events.CardSelect, { id: item.id }),
    });

    return card.render(item);
}

/**  Собирает строку корзины с обработчиком удаления */
function basketCard(item: IProduct, index: number): HTMLElement {
    const card = new CardBasket(cloneTemplate('#card-basket'), {
        onClick: () => events.emit(Events.BasketRemove, { id: item.id }),
    });

    return card.render({ ...item, index: index + 1 });
}

// ==== ОБработчики событий моделей ==== //

// Загрузка / изменение каталога
events.on(Events.CatalogChanged, () => {
    gallery.items = productsModel.getItems().map(catalogCard);
});

// Выбран товар для подробного осмотра
events.on(Events.PreviewChanged, () => {
    const item = productsModel.getSelectedItem();
    if (!item) return;

    modal.content = preview.render(item);
    renderPreviewButton(item);
    modal.open();
});

// Изменение корзины
events.on(Events.BasketChanged, () => {
    header.counter = basketModel.getCount();
    basket.items = basketModel.getItems().map(basketCard);
    basket.price = basketModel.getTotalPrice();
    basket.buttonDisabled = basketModel.getCount() === 0;
});

// Изменение данных покупателя
events.on(Events.BuyerChanged, () => {
    renderFormState();
});

// ==== Обработчики событий представлений ==== //

// Выбор товара в каталоге
events.on(Events.CardSelect, ({ id }: { id: string }) => {
    const item = productsModel.getItem(id);
    if (item) {
        productsModel.setSelectedItem(item);
    }
});

// Кнопка в превью
events.on(Events.PreviewToggle, () => {
    const item = productsModel.getSelectedItem();
    if (!item) return;

    if (basketModel.hasItem(item.id)) {
        basketModel.removeItem(item);
    } else {
        basketModel.addItem(item);
    }

    modal.close();
});

// Удаление товара из корзины
events.on(Events.BasketRemove, ({ id }: { id: string }) => {
    const item = basketModel.getItems().find((product) => product.id === id);
    if (item) {
        basketModel.removeItem(item);
    }
});

// Открытие корзины
events.on(Events.BasketOpen, () => {
    modal.content = basket.render();
    modal.open();
});

// Отркытие первой формы (способ оплаты + адрес)
events.on(Events.OrderOpen, () => {
    modal.content = order.render();
    renderFormState();
    modal.open();
});

// Изменение полей заказа (оплата, адрес) и контактов (email, телефон)
[Events.OrderChange, Events.ContactsChange].forEach((event) => {
    events.on(event, ({ field, value }: { field: keyof IBuyer; value: string }) => {
        buyerModel.setData({ [field]: value } as Partial<IBuyer>);
    });
});

// Переход ко второй форме (контакты)
events.on(Events.OrderSubmit, () => {
    modal.content = contacts.render();
    renderFormState();
});

// Завершение оформление (отправка заказа на сервер)
events.on(Events.ContactsSubmit, () => {
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
        })
        .catch((error) => {
            console.error('Ошибка оформления заказа:', error);
        });
});

// Закрытие модалки после завершения заказа при успехе
events.on(Events.SuccessClose, () => {
    modal.close();
});

// ### ИНИЦИАЛИЗАЦИЯ ### //

header.counter = 0;
basket.items = [];
basket.price = 0;
basket.buttonDisabled = true;

api.getProducts()
    .then((data) => {
        // Итоговым планом было хранить в модели сырой ответ сервера, а URL достраивать
        // при каждом рендере. Сначала рассматривал нормализацию в слое API
        const items = data.items.map((item) => ({
            ...item,
            image: resolveImageUrl(item.image, CDN_URL),
        }));

        productsModel.setItems(items);
    })
    .catch((error) => {
        console.error('Ошибка загрузки каталога:', error);
    });

// events.onAll((event) => console.log(event.eventName));
