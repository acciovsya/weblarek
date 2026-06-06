import { IApi, IProductListResponse, IOrderRequest, IOrderResponse } from '../types';

/**
 * Слой коммуникации с API сервера «Web-ларёк»
 */
export class WebLarekApi {
  private api: IApi;

  constructor(api: IApi) {
    this.api = api;
  }

  /** Запрашивает каталог товаров (GET /product/). */
  getProducts(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/');
  }

  /** Отправляет данные заказа на сервер (POST /order/). */
  orderProducts(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', order);
  }
}
