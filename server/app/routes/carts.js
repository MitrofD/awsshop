// @flow
const carts = require('../api/carts');

module.exports = function cartsRoute() {
  this.get('/carts', Middleware.session, (req, res, next) => {
    carts.get(req.session.id).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.delete('/carts/flush', Middleware.session, (req, res, next) => {
    carts.flush(req.session.id).then((item) => {
      res.json(item);
    }).catch(next);
  });

  this.delete('/carts', (req, res, next) => {
    carts.delete(req.query.id).then((item) => {
      res.json(item);
    }).catch(next);
  });

  this.post('/carts', Middleware.session, Middleware.jsonBodyParser, (req, res, next) => {
    carts.add(req.session.id, req.body.productId, req.body.quantity).then((item) => {
      res.json(item);
    }).catch(next);
  });

  this.post('/carts/set-quantity', Middleware.jsonBodyParser, (req, res, next) => {
    const {
      id,
      quantity,
    } = req.body;

    carts.setQuantity(id, quantity).then((item) => {
      res.json(item);
    }).catch(next);
  });
};
