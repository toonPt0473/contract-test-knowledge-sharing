const axios = require("axios");
const { Product } = require("./product");
const { Order } = require("./order");
class ProductApiClient {
  constructor(url) {
    this.url = url;
  }

  async getProduct(id) {
    return axios
      .get(`${this.url}/products/${id}`)
      .then((r) => new Product(r.data.id, r.data.name, r.data.type, r.data));
  }
}

class OrderClient {
  constructor(url) {
    this.url = url;
  }

  async getOrder(id) {
    return axios
      .get(`${this.url}/orders/${id}`)
      .then((r) => new Order(r.data.id, r.data.name, r.data.type, r.data));
  }
}

module.exports = {
  ProductApiClient,
  OrderClient,
};
