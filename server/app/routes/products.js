// @flow
const aliexpress = require('../api/aliexpress');
const products = require('../api/products');

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
    req.query.isApproved = true;

    products.get(req.query).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.get('/admin-products/:categoryId?', Middleware.admin_Sess, (req, res, next) => {
    const getQuery: { [string]: any } = req.query;

    if (req.params.categoryId) {
      getQuery.categoryId = req.params.categoryId;
    }

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

  this.get('/aliexpress-products/:id', (req, res, next) => {
    const productUrl = aliexpress.getUrl(req.params.id);

    products.withUrl(productUrl).then((product) => {
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

  this.post('/aliexpress-products/:id', Middleware.userId_Sess, (req, res, next) => {
    aliexpress.getData(req.params.id).then((data) => {
      // eslint-disable-next-line no-param-reassign
      data.type = products.SHOP_TYPE.ALIEXPRESS;
      products.add(req.userId, data).then((product) => {
        res.json(product);
      }).catch(next);
    }).catch(next);
  });

  this.put('/products/:id', Middleware.userId_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    const isAdmin = req.session.get(Enums.SESS_USER_IS_ADMIN);
    const pureArrsObj = getPureArrObj(req.body);
    Object.assign(req.body, pureArrsObj);

    products.update(req.userId, req.params.id, req.body, isAdmin).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
