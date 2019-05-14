// @flow
const vacancies = require('../api/vacancies');

module.exports = function makeRoute() {
  this.get('/vacancies', Middleware.admin_Sess, (req, res, next) => {
    vacancies.get(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/vacancy/:id', (req, res, next) => {
    vacancies.withId(req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.delete('/vacancy/:id', Middleware.admin_Sess, (req, res, next) => {
    vacancies.remove(req.params.id).then((page) => {
      res.json(page);
    }).catch(next);
  });

  this.post('/vacancy', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    vacancies.add(req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/vacancy/:id', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    vacancies.update(req.params.id, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
