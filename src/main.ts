import { Api } from './components/base/Api';
import { Basket } from './components/base/Models/Basket';
import { Buyer } from './components/base/Models/Buyer';
import { Products } from './components/base/Models/Products';
import { WebLarekApi } from './components/WebLarekApi';
import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { apiProducts } from './utils/data';

const productsModel = new Products();
const basketModel = new Basket();
const buyerModel = new Buyer();

/* ----------------------------- Модель Products ---------------------------- */

console.log('===== Модель Products (каталог) =====');

productsModel.setItems(apiProducts.items);
console.log('Массив товаров из каталога: ', productsModel.getItems());

const firstProduct = productsModel.getItems()[0];
const secondProduct = productsModel.getItems()[1];

console.log('Товар по id (существующий): ', productsModel.getItem(firstProduct.id));
console.log('Товар по id (несуществующий): ', productsModel.getItem('wrong-id'));

productsModel.setSelectedItem(firstProduct);
console.log('Выбранный товар после setSelectedItem: ', productsModel.getSelectedItem());

/* ------------------------------ Модель Basket ----------------------------- */

console.log('===== Модель Basket (корзина) =====');

console.log('Корзина изначально пуста: ', basketModel.getItems());

basketModel.addItem(firstProduct);
basketModel.addItem(secondProduct);
console.log('Товары в корзине после addItem (2 шт.): ', basketModel.getItems());

console.log('Количество товаров в корзине: ', basketModel.getCount());
console.log('Суммарная стоимость товаров в корзине: ', basketModel.getTotalPrice());

console.log('Есть ли в корзине первый товар (true): ', basketModel.hasItem(firstProduct.id));
console.log('Есть ли в корзине товар с id "wrong-id" (false): ', basketModel.hasItem('wrong-id'));

basketModel.removeItem(firstProduct);
console.log('Товары в корзине после removeItem первого: ', basketModel.getItems());
console.log('Количество товаров после удаления: ', basketModel.getCount());

basketModel.clear();
console.log('Корзина после clear: ', basketModel.getItems());
console.log('Количество товаров после clear: ', basketModel.getCount());

/* ------------------------------ Модель Buyer ------------------------------ */

console.log('===== Модель Buyer (покупатель) =====');

console.log('Данные покупателя изначально: ', buyerModel.getData());
console.log('Валидация пустых данных (ошибки по всем полям): ', buyerModel.validate());

buyerModel.setData({ address: 'Москва, ул. Пушкина, д. 1' });
console.log('Данные после сохранения только address: ', buyerModel.getData());
console.log('Валидация после ввода только address (3 ошибки): ', buyerModel.validate());

buyerModel.setData({ payment: 'card', email: 'test@example.com', phone: '+79001234567' });
console.log('Данные после заполнения всех полей: ', buyerModel.getData());
console.log('Валидация полных данных (ошибок нет, {}): ', buyerModel.validate());

buyerModel.clear();
console.log('Данные покупателя после clear: ', buyerModel.getData());

const api = new WebLarekApi(new Api(API_URL));

api
  .getProducts()
  .then((data) => {
    productsModel.setItems(data.items);
    console.log('Каталог, полученный с сервера: ', productsModel.getItems());
  })
  .catch((error) => console.error('Ошибка загрузки каталога: ', error));
