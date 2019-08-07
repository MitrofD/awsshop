// @flow
const solidpayments = require('../api/solidpayments');

module.exports = function cartsRoute() {
  this.post('/getCheckoutId', Middleware.session, Middleware.jsonBodyParser, (req, res, next) => {
    const ip = req.headers['x-forwarded-for']
      || req.connection.remoteAddress
      || req.socket.remoteAddress
      || (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const requestData = {
      ip,
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      country: req.body.country,
      city: req.body.city,
      stateP: req.body.stateP,
      address: req.body.address,
      apartment: req.body.apartment,
      zip: req.body.zip,
    };
    solidpayments.getCheckoutData(req.session.id, requestData).then(({ id }) => {
      res.json(id);
    }).catch(next);
  });

  this.post('/getOrderInfo', Middleware.jsonBodyParser, (req, res, next) => {
    const { id } = req.body;

    solidpayments.getOrderInfo(id).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
