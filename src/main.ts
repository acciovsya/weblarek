import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { BasketModel } from './components/models/BasketModel';
import { ProductsModel } from './components/models/ProductsModel';
import { Basket } from './components/views/Basket';
import { CardBasket } from './components/views/Card/CardBasket';
import { CardCatalog } from './components/views/Card/CardCatalog';
import { CardPreview } from './components/views/Card/CardPreview';
import { Gallery } from './components/views/Gallery';
import { Header } from './components/views/Header';
import { Modal } from './components/views/Modal';
import { WebLarekApi } from './components/WebLarekApi';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, resolveImageUrl } from './utils/utils';

import './scss/styles.scss';
import { IProduct } from './types';

const events = new EventEmitter();

// Модели
const productsModel = new ProductsModel(events);
const basketModel = new BasketModel(events);

// Слой коммуникации
const baseApi = new Api(API_URL);
const api = new WebLarekApi(baseApi);

// Представления
const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);

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

// ==== ОБработчики событий моделей ====
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

    // Если открыто превью — пересчитываем состояние его кнопки
    const selected = productsModel.getSelectedItem();
    if (preview && selected) {
        renderPreviewButton(selected);
    }
});

// ==== Обработчики событий представлений ====

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

// Оформление заказа- формы ещё не реализованы - заглушка
events.on('order:open', () => {
    console.log('пока нету');
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

events.onAll(({ eventName }) => console.log('ивент:', eventName));
