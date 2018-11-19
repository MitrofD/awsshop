// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';

type Props = {
  _id: string,
  image: string,
  price: number,
  title: string,
};

const Product = (props: Props) => {
  const previewStype = {
    backgroundImage: `url(${props.image})`,
  };

  const productLink = `/product/${props._id}`;

  return (
    <a
      className="Product col-md-3"
      href={productLink}
    >
      <div
        className="prvw"
        style={previewStype}
      >
        <div className="actn">
          <button className="btn btn-light animated pulse">
            {tt('Add to cart')}
          </button>
        </div>
      </div>
      <div className="nm">{props.title}</div>
      <div className="prc">ETH {props.price}</div>
    </a>
  );
};

export default Product;
