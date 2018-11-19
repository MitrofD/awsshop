// @flow
const bodyParser = require('body-parser');
const querystring = require('querystring');
const request = require('request');
const products = require('../api/products');

const bodyUrlencodedMiddleware = bodyParser.urlencoded({
  extended: false,
});

module.exports = function productsRoute() {
  this.get('/products/:categoryId?', (req, res, next) => {
    if (req.params.categoryId) {
      req.query.categoryId = req.params.categoryId;
    }

    products.get(req.query).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/raw-products/:categoryId?', Middleware.userId_Sess, (req, res, next) => {
    const getQuery: { [string]: any } = req.query;
    getQuery.userId = req.userId;

    if (req.params.categoryId) {
      getQuery.categoryId = req.params.categoryId;
    }

    products.getRaw(getQuery).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/products/:id', (req, res, next) => {
    products.withId(req.params.id).then((product) => {
      res.json(product);
    }).catch(next);
  });

  this.get('/products/url/:url', (req, res, next) => {
    const pureURL = querystring.unescape(req.params.url);

    products.withUrl(pureURL).then((product) => {
      res.json(product);
    }).catch(next);
  });

  this.delete('/products/:id', Middleware.userId_Sess, (req, res, next) => {
    products.remove(req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/products/:id', Middleware.userId_Sess, (req, res, next) => {
    products.add(req.userId, req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/products', Middleware.userId_Sess, bodyUrlencodedMiddleware, (req, res, next) => {
    const finishFunc = () => {
      const arrayFields = [
        'images',
        'tags',
      ];

      arrayFields.forEach((field) => {
        const needField = `${field}[]`;
        req.body[field] = req.body[needField];
        delete req.body[needField];
      });

      products.addRow(req.userId, req.body).then((product) => {
        res.json(product);
      }).catch(next);
    };

    if (typeof req.body.descriptionUrl === 'string') {
      request(req.body.descriptionUrl, (error, response, body) => {
        if (error) {
          next(error);
          return;
        }

        req.body.description = body;
        finishFunc();
      });
    } else {
      finishFunc();
    }
  });

  /*
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
  */
};
