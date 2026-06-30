import { Api } from './components/base/Api';
import { Products } from './components/models/Products';
import { CardCatalog } from './components/views/Card/CardCatalog';
import { Gallery } from './components/views/Gallery';
import { WebLarekApi } from './components/WebLarekApi';
import './scss/styles.scss';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement, resolveImageUrl } from './utils/utils';

const productsModel = new Products();

const baseApi = new Api(API_URL);
const api = new WebLarekApi(baseApi);

const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));

api.getProducts()
    .then((data) => {
        productsModel.setItems(data.items);

        const cards = productsModel.getItems().map((item) => {
            const card = new CardCatalog(cloneTemplate('#card-catalog'), {
                onClick: () => {
                    console.log(item.image);
                },
            });

            return card.render({ ...item, image: resolveImageUrl(item.image, CDN_URL) });
        });

        gallery.items = cards;
    })
    .catch((error) => {
        console.error('Ошибка загрузки каталога:', error);
    });
