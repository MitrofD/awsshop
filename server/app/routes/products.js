// @flow
const bodyParser = require('body-parser');
const querystring = require('querystring');
const request = require('request');
const products = require('../api/products');

const bodyUrlencodedMiddleware = bodyParser.urlencoded({
  extended: false,
});

const getPureArrObj = (obj: Object) => {
  const pureObj = {};

  const arrayFields = [
    'images',
    'tags',
  ];

  arrayFields.forEach((field) => {
    const needField = `${field}[]`;

    if (Tools.isArray(obj[needField])) {
      pureObj[field] = obj[needField];
    }
  });

  return pureObj;
};

module.exports = function productsRoute() {
  this.get('/products/:categoryId?', (req, res, next) => {
    if (req.params.categoryId) {
      req.query.categoryId = req.params.categoryId;
    }

    req.query.isPaused = false;

    products.get(req.query).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/my-products/:categoryId?', Middleware.userId_Sess, (req, res, next) => {
    const getQuery: { [string]: any } = req.query;
    getQuery.userId = req.userId;

    if (req.params.categoryId) {
      getQuery.categoryId = req.params.categoryId;
    }

    products.get(getQuery).then((data) => {
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

  this.get('/products/id/:id', (req, res, next) => {
    products.withId(req.params.id, {
      isPaused: false,
    }).then((product) => {
      res.json(product);
    }).catch(next);
  });

  this.get('/products/url/:url', (req, res, next) => {
    const pureURL = querystring.unescape(req.params.url);

    products.withUrl(pureURL, {
      isPaused: false,
    }).then((product) => {
      res.json(product);
    }).catch(next);
  });

  this.delete('/my-products/:id', Middleware.userId_Sess, (req, res, next) => {
    products.remove(req.userId, req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.delete('/raw-products/:id', Middleware.userId_Sess, (req, res, next) => {
    products.rawRemove(req.userId, req.params.id).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/products/:rawId', Middleware.userId_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    const pureArrsObj = getPureArrObj(req.body);
    Object.assign(req.body, pureArrsObj);

    products.push(req.userId, req.params.rawId, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.post('/products', Middleware.userId_Sess, bodyUrlencodedMiddleware, (req, res, next) => {
    const finishFunc = () => {
      const pureArrsObj = getPureArrObj(req.body);
      Object.assign(req.body, pureArrsObj);

      products.add(req.userId, req.body).then((product) => {
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

  this.put('/products/:id', Middleware.userId_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    const pureArrsObj = getPureArrObj(req.body);
    Object.assign(req.body, pureArrsObj);

    products.update(req.userId, req.params.id, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
