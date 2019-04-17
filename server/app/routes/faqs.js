// @flow
const faqs = require('../api/faqs');

module.exports = function faqsRoute() {
  this.delete('/faqs/:itemId', Middleware.admin_Sess, (req, res, next) => {
    faqs.remove(req.params.itemId).then((faq) => {
      res.json(faq);
    }).catch(next);
  });

  this.get('/faqs', (req, res, next) => {
    faqs.get(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.post('/faqs', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    faqs.add(req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/faqs/:itemId', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    faqs.update(req.params.itemId, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
