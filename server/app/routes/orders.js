// @flow
/*
const cartProducts = require('../api/cart-products');
const orders = require('../api/orders');

module.exports = function ordersRoute() {
  this.get('/orders', Middleware.admin_Sess, (req, res, next) => {
    orders.get(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/orders/cart', Middleware.userId_Sess, (req, res, next) => {
    cartProducts.getForUser(req.userId).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/orders/customer', Middleware.userId_Sess, (req, res, next) => {
    const pureQuery = Object.assign({
      ownerId: req.userId,
    }, req.query);

    orders.get(pureQuery).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/orders/my', Middleware.userId_Sess, (req, res, next) => {
    const pureQuery = Object.assign({
      userId: req.userId,
    }, req.query);

    orders.get(pureQuery).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.delete('/orders/:id', Middleware.userId_Sess, (req, res, next) => {
    cartProducts.remove(req.userId, req.params.id).then((product) => {
      res.json(product);
    }).catch(next);
  });

  this.post('/orders/gen-order-id', Middleware.userId_Sess, (req, res, next) => {
    cartProducts.genOrderId(req.userId).then((orderId) => {
      res.json(orderId);
    }).catch(next);
  });

  this.post('/orders/:id', Middleware.userId_Sess, (req, res, next) => {
    cartProducts.add(req.userId, req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/orders/apply/:orderId', Middleware.userId_Sess, (req, res, next) => {
    cartProducts.apply(req.userId, req.params.orderId).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });

  this.put('/orders/:orderId', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    orders.update(req.params.orderId, req.body).then((order) => {
      res.json(order);
    }).catch(next);
  });
};
*/
