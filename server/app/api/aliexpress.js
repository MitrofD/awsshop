// @flow
const cheerio = require('cheerio');
const request = require('request');

const BASE_CURRENCY = 'USD';
const UPDATE_RATES_DELAY = 30000;
let RATES = {};

(function updateRates(delay: number) {
  setTimeout(() => {
    request.get(`https://api.exchangeratesapi.io/latest?base=${BASE_CURRENCY}`, (error, response, body) => {
      if (error) {
        updateRates(UPDATE_RATES_DELAY);
        return;
      }

      try {
        const mbJSON = JSON.parse(body);

        if (typeof mbJSON.rates === 'object' && mbJSON.rates !== null) {
          RATES = mbJSON.rates;
        }
        // eslint-disable-next-line no-empty
      } catch (pError) {}

      updateRates(UPDATE_RATES_DELAY);
    });
  }, delay);
}(0));

const urlWithProductId = (productId: any) => {
  if (typeof productId === 'string' || typeof productId === 'number') {
    const strProductId = productId.toString();
    return `https://www.aliexpress.com/item/xxx/${strProductId}.html`;
  }

  throw new Error('productId has to be string type');
};

const getUrlDesc = (jQuery: Object, url: string): Promise<string> => {
  const rPromise = new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error) {
        reject(error);
        return;
      }

      const wrapped = jQuery(`<div class="desc">${body}</div>`);
      wrapped.find('kse\\:widget').remove();
      wrapped.find('script').remove();
      wrapped.find('div:has(div:has(div:has(div:has(div:has(a)))))').remove();
      resolve(wrapped.html());
    });
  });

  return rPromise;
};

const rObj = {
  getUrl: urlWithProductId,

  async getData(productId: any): Promise<Object> {
    const productUrl = this.getUrl(productId);

    const promise = new Promise((resolve, reject) => {
      request.get(productUrl, (error, response, body) => {
        if (error) {
          reject(error);
          return;
        }

        const $ = cheerio.load(body);
        const sendData = {};

        // title
        const title = $('.product-name').first().text();

        // image
        const mainImage = $('#magnifier .ui-image-viewer-thumb-frame').children('img').first().attr('src');

        // price
        let price = 0;
        const jsonVariations = /var.skuProducts=(.*);/.exec(body);

        if (jsonVariations) {
          try {
            const mbJSON = JSON.parse(jsonVariations[1]);
            const item = mbJSON[0];

            const {
              currency,
              value,
            } = item.skuVal.skuAmount;

            price = value;

            if (currency !== BASE_CURRENCY) {
              const convertPrice = RATES[currency];

              if (typeof convertPrice === 'number') {
                price /= convertPrice;
              } else {
                reject(new Error(`${currency} not available`));
                return;
              }
            }

          // eslint-disable-next-line no-empty
          } catch (pError) {}
        }

        // seller
        const sellerLink = $('#j-store-info-wrap .store-lnk').attr('href');

        // tags
        const tags = [];
        $('.ui-breadcrumb a').each(function tagsEach() {
          const tag = $(this).text();
          tags.push(tag);
        });

        tags.splice(0, 1);

        // images
        const images = [];
        $('#j-image-thumb-list').find('img').each(function imagesEach() {
          const imgSrc = $(this).attr('src');
          images.push(imgSrc);
        });

        const descMatches = /window.runParams.detailDesc="(.*)";/.exec(body);
        const shipping = null;

        if (descMatches) {
          const props = $('.product-property-main').first().html();
          const descUrl = descMatches[1];

          getUrlDesc($, descUrl).then((description) => {
            const commonDesc = `<div id="j-product-desc">${props}${description}</div>`;
            sendData.description = commonDesc;
            sendData.title = title;
            sendData.url = productUrl;
            sendData.tags = tags;
            sendData.mainImage = mainImage;
            sendData.images = images;
            sendData.price = price;
            sendData.shipping = shipping;
            sendData.sellerLink = sellerLink;
            resolve(sendData);
          }).catch(reject);
        } else {
          reject(new Error('Description url not found'));
        }
      });
    });

    return promise;
  },
};

module.exports = rObj;
