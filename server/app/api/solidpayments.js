// @flow
const https = require('https');
const querystring = require('querystring');
const carts = require('./carts');
const tools = require('./tools');

const ENTITY_ID = '8a829418523f460601524029dfda0327';
const USER_ID = '8a829418523f46060152402996670325';
const PASSWORD = '2W9YjWb8';
const BEARER = 'OGE4Mjk0MTg1MjNmNDYwNjAxNTI0MDI5OTY2NzAzMjV8Mlc5WWpXYjg=';

// Response codes
const SUCCESSFULLY_CREATED_CHECKOUT = /^(000\.200)/;
const SUCCESSFULLY_PROCESSED_TRANSACTIONS = /^(000\.000\.|000\.100\.1|000\.[36])/;

const REQUEST_HOST = 'test.solidpayments.net'; // test server
const REQUEST_CHECKOUT_PATH = '/v1/checkouts';
const REQUEST_CURRENCY = 'USD';

const validate = (requestData: Object) => {
  if (!requestData.firstname) {
    throw new Error('Firstname is empty');
  }

  if (!requestData.lastname) {
    throw new Error('Lastname is empty');
  }

  if (!requestData.email || !tools.emailRegExp.test(requestData.email)) {
    throw new Error('Email is empty or incorrect');
  }

  if (!requestData.ip) {
    throw new Error('Ip is empty');
  }

  if (!requestData.address) {
    throw new Error('Address is empty');
  }

  if (!requestData.city) {
    throw new Error('City is empty');
  }

  if (!requestData.zip) {
    throw new Error('Zip is empty');
  }

  if (!requestData.country) {
    throw new Error('Country is empty');
  }
};

const rObj = {
  async getCheckoutData(id: string, requestData: Object): Promise<Object> {
    const cartItems = await carts.get(id);
    const cartItemsLength = cartItems.length;
    let amount = 0;
    let i = 0;
    for (; i < cartItemsLength; i += 1) {
      const item = cartItems[i];
      const itemAmount = item.quantity * tools.getPrice(item);
      amount += itemAmount;
    }

    validate(requestData);
    const sendData = querystring.stringify({
      entityId: ENTITY_ID,
      amount: amount.toFixed(2),
      currency: REQUEST_CURRENCY,
      paymentType: 'DB',
      'customer.givenName': requestData.firstname,
      'customer.surname': requestData.lastname,
      'customer.email': requestData.email,
      'customer.ip': requestData.ip,
      'billing.street1': requestData.address,
      'billing.city': requestData.city,
      'billing.postcode': requestData.zip,
      'billing.country': requestData.country,
    });

    const options = {
      path: REQUEST_CHECKOUT_PATH,
      port: 443,
      host: REQUEST_HOST,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': sendData.length,
        Authorization: `Bearer ${BEARER}`,
      },
    };

    const promise = new Promise((resolve, reject) => {
      const postRequest = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          const jsonRes = JSON.parse(chunk);
          if (jsonRes.result && jsonRes.result.code && jsonRes.result.code.match(SUCCESSFULLY_CREATED_CHECKOUT)) {
            resolve(jsonRes);
          } else {
            const description = jsonRes.result && jsonRes.result.description ? jsonRes.result.description : 'Something went wrong';
            const error = new Error(description);
            reject(error);
          }
        });
      });
      postRequest.on('error', (e) => {
        reject(e);
      });
      postRequest.write(sendData);
      postRequest.end();
    });

    return promise;
  },

  async getOrderInfo(id: any): Promise<Object> {
    const options = {
      path: `/v1/checkouts/${id}/payment?entityId=${ENTITY_ID}`,
      port: 443,
      host: REQUEST_HOST,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${BEARER}`,
      },
    };

    const promise = new Promise((resolve, reject) => {
      const postRequest = https.request(options, (res) => {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          const jsonRes = JSON.parse(chunk);
          if (jsonRes.result && jsonRes.result.code && jsonRes.result.code.match(SUCCESSFULLY_PROCESSED_TRANSACTIONS)) {
            resolve(jsonRes);
          } else {
            const description = jsonRes.result && jsonRes.result.description ? jsonRes.result.description : 'Something went wrong';
            reject(new Error(description));
          }
        });
      });
      postRequest.on('error', (e) => {
        reject(e);
      });
      postRequest.end();
    });

    return promise;
  },
};

module.exports = rObj;
