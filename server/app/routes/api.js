// @flow
const users = require('../api/users');

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
  const purchasePath = `${basePath}/purchase`;

  this.post(purchasePath, Middleware.jsonBodyParser, (req, res, next) => {
    checkToken(req.params.token);

    users.soldProductInQuantities(req.body.id, req.body.quantitys).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });
};
