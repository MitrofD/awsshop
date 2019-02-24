// @flow
// const request = require('request');

module.exports = function dataRoute() {
  this.get('/data/start-of-month-time', (req, res) => {
    const startOfMonthDate = Tools.startOfMonthDate();
    res.json(startOfMonthDate.getTime());
  });

  /*
  this.get('/data/eth-price', (req, res, next) => {
    const symbol = 'ETHUSDT';
    const getEthUrl = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;

    request(getEthUrl, (error, response, body) => {
      if (error) {
        next(error);
        return;
      }

      let json = {};

      try {
        json = JSON.parse(body);
      } catch (pError) {
        next(pError);
        return;
      }

      if (Tools.has.call(json, 'price')) {
        const pureVal = parseFloat(json.price) || 0;
        res.json(pureVal);
        return;
      }

      const errorText = json.msg || Tools.genUnknownError(`Get ${symbol} price`);
      next(new Error(errorText));
    });
  });
  */
};
