// @flow
import React from 'react';
import Product from './Product';
import { tt } from '../../components/TranslateElement';

const randomFromTo = (from: number, to: number): number => {
  const rVal = Math.floor(Math.random() * to) + from;
  return rVal;
};

/* eslint-disable max-len */

const images: string[] = [
  'https://www.notebookcheck-ru.com/uploads/tx_nbc2/SamsungGalaxyS8Active__1_.jpg',
  'https://i5.walmartimages.com/asr/08f5c0a5-d45c-4b00-969e-75158b225af0_1.41822ef269d39eab6ab76c12a5d166cd.jpeg',
  'https://static-ca.ebgames.ca/images/products/710007/3max.jpg',
  'https://brain-images-ssl.cdn.dixons.com/7/3/10170337/u_10170337.jpg',
  'https://www.itbazaar.com.bd/products/mega/dragonwar-joystick-wireless-gaming-controller-8067824-8249982.jpg',
  'https://www.gamesmen.com.au/media/catalog/product/cache/1/image/9df78eab33525d08d6e5fb8d27136e95/p/l/playstation_vr_v2_headset_1_.jpg',
  'https://img.mvideo.ru/Pdb/40052285b.jpg',
  'https://hniesfp.imgix.net/8/images/detailed/73/playstation_vr_worlds.jpg',
  'https://istyle.ro/pub/media/wysiwyg/MK/m2-cat-_0003s_0002_iphone-x.jpg',
];

/* eslint-enable max-len */

const names: string[] = [
  'Sony Playstation 4 Slim 500GB',
  'Xbox One Black 500GB',
  'Nintendo switch with two jot c...',
  'Sony Playstation Vita Wifi + 3G',
  'Sony Playstation 4 Slim 500GB',
  'Xbox One Black 500GB',
  'Nintendo switch with two jot c...',
];

const prices: number[] = [
  0.24471,
  1.6,
  2.3,
  1.4,
  1.85712,
  2.3,
  1.6,
];

const getImage = (function genGetImageFunc() {
  const imagesLength = images.length;

  if (imagesLength === 0) {
    return () => '';
  }

  const maxIdx = imagesLength;

  return () => {
    const randIdx = randomFromTo(0, maxIdx);
    const image = images[randIdx];
    return image;
  };
}());

const getName = (function genGetNameFunc() {
  const namesLength = names.length;

  if (namesLength === 0) {
    return () => '';
  }

  const maxIdx = namesLength;

  return () => {
    const randIdx = randomFromTo(0, maxIdx);
    const name = names[randIdx];
    return name;
  };
}());

const getPrice = (function genGetPriceFunc() {
  const pricesLength = names.length;

  if (pricesLength === 0) {
    return () => 0;
  }

  const maxIdx = pricesLength;

  return () => {
    const randIdx = randomFromTo(0, maxIdx);
    const price = prices[randIdx];
    return price;
  };
}());

const Products = () => {
  const products = [];
  const rand = randomFromTo(15, 30);

  for (let i = 0; i < rand; i += 1) {
    const id = `prdct_${i}`;
    const image = getImage();
    const name = getName();
    const price = getPrice();

    const product = (
      <div
        className="col-sm-6 col-md-4 col-lg-3"
        key={id}
      >
        <Product
          _id={id}
          image={image}
          name={name}
          price={price}
        />
      </div>
    );

    products.push(product);
  }

  return (
    <div className="Products">
      <div className="ttl">{tt('Products')}</div>
      <div className="row">
        {products}
      </div>
    </div>
  );
};

export default Products;
