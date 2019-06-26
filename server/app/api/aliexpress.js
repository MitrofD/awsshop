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

      const pureBody = body.replace(/href="(.*?)"/g, 'href="!#"');
      const wrapped = jQuery(`<div class="desc">${pureBody}</div>`);
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
      const cookie = request.cookie('intl_locale=en_US');

      // Set the headers for the request
      const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux i686) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
        Cookie: 'intl_locale=en_US; aep_usuc_f=region=AU&site=glo&b_locale=en_US&c_tp=USD; xman_us_f=x_l=0&x_locale=en_US',
        Accept: '/',
        Connection: 'keep-alive',
      };
      // Configure the request
      const options = {
        url: productUrl,
        method: 'GET',
        headers,
      };

      request(options, (error, response, body) => {
        let skuProducts;
        if (error) {
          reject(error);
          return;
        }

        const $ = cheerio.load(body);
        const sendData = {};
        let configurable;
        let clearSkuProducts;
        let isConfigurable = false;
        let minPrice = 0;
        let maxPrice = 0;

        // title
        const title = $('.product-name').first().text();

        // image
        const mainImage = $('#magnifier .ui-image-viewer-thumb-frame').children('img').first().attr('src');

        $('script').get().forEach((item) => {
          if (item.children[0] && item.children[0].data.match(/skuProducts/)) {
            const test = item.children[0].data.match(/var (skuProducts=.*)var/mis);
            const minPriceArray = item.children[0].data.match(/window.runParams.minPrice="([^\"]+)"/mis);// eslint-disable-line
            const maxPriceArray = item.children[0].data.match(/window.runParams.maxPrice="([^\"]+)"/mis);// eslint-disable-line
            minPrice = minPriceArray[1];
            maxPrice = maxPriceArray[1];
            eval(test[1].trim());
          }
        });

        if (skuProducts) {
          isConfigurable = true;
          configurable = [];
          let configurableItemOrder = 1;
          $('#j-product-info-sku .p-property-item').each(function (index, elem) {
            const configurableItemName = $(this)
              .find('.p-item-title')
              .first()
              .html()
              .trim()
              .replace(/:$/, '');
            const configurableItemId = $(this)
              .find('.sku-attr-list')
              .attr('data-sku-prop-id');
            const configurableItem = {
              skuPropertyName: configurableItemName,
              order: configurableItemOrder,
              skuPropertyId: parseInt(configurableItemId, 10),
              skuPropertyValues: [],
            };
            let skuPropertyValuesOrder = 1;
            // configurable[configurableFieldData] = [];
            $(this).find('li').each(function (index1, elem1) {
              const a = $(this).find('a');
              let propertyValueName;
              let skuPropertyImagePath;
              const propertyValueId = a.data('sku-id');
              const skuChildren = $(this).find('a').children();

              switch (skuChildren.get(0).tagName) {
                case 'img':
                  skuPropertyImagePath = skuChildren.attr('src');
                  propertyValueName = skuChildren.attr('title');
                  break;
                case 'span':
                  propertyValueName = skuChildren.first().html();
                  break;
                default:
              }
              const skuPropertyValues = {
                propertyValueName,
                propertyValueId,
                skuPropertyImagePath,
                skuPropertyValuesOrder,
              };
              configurableItem.skuPropertyValues.push(skuPropertyValues);
              skuPropertyValuesOrder += 1;
            });
            configurable.push(configurableItem);
            configurableItemOrder += 1;
          });

          clearSkuProducts = skuProducts.map(function (findItem) {
            const { ...newItem } = findItem;
            const {
              currency,
              value,
            } = newItem.skuVal.skuAmount;

            let clearPrice = value;

            if (currency !== BASE_CURRENCY) {
              const convertPrice = RATES[currency];

              if (typeof convertPrice === 'number') {
                clearPrice /= convertPrice;
              } else {
                reject(new Error(`${currency} not available`));
              }
            }

            newItem.skuVal.skuAmount.currency = BASE_CURRENCY;
            newItem.skuVal.skuAmount.value = clearPrice;
            if (newItem.skuAttr) {
              newItem.skuAttr = newItem.skuAttr.replace(/#[^;]*/, '');
            }

            return newItem;
          });
        }

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
            sendData.isConfigurable = isConfigurable;
            sendData.configurable = configurable;
            sendData.skuProducts = clearSkuProducts;
            sendData.minPrice = minPrice;
            sendData.maxPrice = maxPrice;
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
