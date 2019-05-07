// @flow
const genProduct = (product: Object) => {
  const rProduct: { [string]: any } = {
    product_price: product.price,
    seller_profit: product.earnings,
    time: product.createdAt,
    qty: product.quantity,
    order_id: product._id,
  };

  if (product.event_id) {
    rProduct.event_id = product.event_id;
  }

  return rProduct;
};

const crm = {
  genProduct,
};

module.exports = crm;
