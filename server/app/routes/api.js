// @flow
const users = require('../api/users');
const products = require('../api/products');
const crmHelper = require('../helpers/crm');

const INCORRECT_LINK = 'product_link is incorrect';

const getProductIdByUrl = (function getProductIdByUrlFunc() {
  const productUrlBase = `${Config.url}/product/`;
  const productStartPos = productUrlBase.length;

  return (mbUrl: any) => {
    if (typeof mbUrl === 'string') {
      const url = mbUrl.trim();
      return url.substr(productStartPos);
    }

    return null;
  };
}());

const API_VERSION = 1.1;
const apiVersionText = `v${API_VERSION}`;

const checkToken = (token: any) => {
  const pToken = Tools.anyAsStr(token);
  const currToken = Settings.getOption('TOKEN');

  if (pToken !== currToken) {
    throw new Error('Token is incorrect');
  }
};

module.exports = function apiRoutes() {
  const basePath = `/api/${apiVersionText}/:token`;

  this.get(`${basePath}/product`, (req, res, next) => {
    checkToken(req.params.token);
    const productId = getProductIdByUrl(req.query.product_link);

    if (productId) {
      products.withId(productId).then((product) => {
        res.json(product);
      }).catch(next);
      return;
    }

    next(new Error(INCORRECT_LINK));
  });

  this.post(`${basePath}/sale`, Middleware.jsonBodyParser, (req, res, next) => {
    checkToken(req.params.token);

    const errors = {};
    const responseData = [];
    let responseDataLength = responseData.length;
    const reqArray = Array.isArray(req.body) ? req.body : [];

    const rPromise = new Promise((resolve, reject) => {
      (function saleProduct() {
        if (reqArray.length > 0) {
          const item = reqArray.shift();

          if (typeof item === 'object' && item !== null) {
            const productId = getProductIdByUrl(item.product_link);

            if (productId) {
              const itemTime = typeof item.time === 'number' ? item.time * 1000 : null;

              users.saleProduct(productId, {
                time: itemTime,
                quantity: item.qty,
                event_id: item.event_id,
              }).then((product) => {
                const crmProduct = crmHelper.genProduct(product);
                crmProduct.product_link = item.product_link;
                responseData[responseDataLength] = crmProduct;
                responseDataLength += 1;
                saleProduct();
              }).catch((error) => {
                errors[productId] = error.message;
                saleProduct();
              });
            } else {
              errors[item.product_link] = INCORRECT_LINK;
              saleProduct();
            }
          }
          return;
        }

        resolve();
      }());
    });

    rPromise.then(() => {
      res.json({
        errors,
        data: responseData,
      });
    }).catch(next);
  });
};
