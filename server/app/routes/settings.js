// @flow
module.exports = function settingsRoute() {
  this.get('/settings', (req, res) => {
    const rSettings = Settings.get();
    res.json(rSettings);
  });

  this.put('/settings', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    Settings.set(req.body).then((answer) => {
      res.json(answer);
    }).catch(next);
  });
};
