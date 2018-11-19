// @flow
const categories = require('../api/categories');

module.exports = function categoriesRoute() {
  this.get('/categories', (req, res, next) => {
    categories.get(req.query).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/categories/:name', (req, res, next) => {
    categories.withName(req.params.name).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.delete('/categories/:id', Middleware.admin_Sess, (req, res, next) => {
    categories.remove(req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/categories', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    categories.add(req.body.name).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/categories/:id', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    categories.update(req.params.id, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
