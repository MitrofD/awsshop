// @flow
const pages = require('../api/pages');

module.exports = function pagesRoute() {
  this.get('/pages', Middleware.admin_Sess, (req, res, next) => {
    pages.get(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/page', (req, res, next) => {
    const {
      id,
      path,
    } = req.query;

    if (id) {
      pages.withId(id).then((data) => {
        res.json(data);
      }).catch(next);
      return;
    }

    if (path) {
      pages.withPath(path).then((data) => {
        res.json(data);
      }).catch(next);
      return;
    }

    next(new Error('Incorrect request'));
  });

  this.delete('/pages/:pageId', Middleware.admin_Sess, (req, res, next) => {
    pages.remove(req.params.pageId).then((page) => {
      res.json(page);
    }).catch(next);
  });

  this.post('/pages', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    pages.add(req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/pages/:pageId', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    pages.update(req.params.pageId, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
