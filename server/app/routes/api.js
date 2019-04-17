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

  this.post(`${basePath}/purchase`, Middleware.jsonBodyParser, (req, res, next) => {
    checkToken(req.params.token);

    users.soldProductInQuantities(req.body.id, req.body.quantities).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });
};
