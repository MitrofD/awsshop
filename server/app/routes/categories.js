// @flow
const categories = require('../api/categories');

module.exports = function categoriesRoute() {
  this.get('/categories', (req, res, next) => {
    categories.get(req.query).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/category', (req, res, next) => {
    const {
      id,
      name,
    } = req.query;

    if (id) {
      categories.withId(id).then((data) => {
        res.json(data);
      }).catch(next);
      return;
    }

    if (name) {
      categories.withName(name).then((data) => {
        res.json(data);
      }).catch(next);
      return;
    }

    const getError = new Error('Incorrect request');
    next(getError);
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

  this.put('/category/:id', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    categories.update(req.params.id, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
