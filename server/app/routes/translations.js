// @flow
module.exports = function translationsRoute() {
  this.get('/translationsInfo', (req, res) => {
    const data: { [string]: any } = Translations.forLangOrDef(req.query.lang);
    data.list = Translations.list();
    res.json(data);
  });

  this.get('/translation', (req, res) => {
    const translation = Translations.forLangOrDef(req.query.lang);
    res.json(translation);
  });
};
