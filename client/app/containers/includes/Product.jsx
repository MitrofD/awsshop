// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';
import carts from '../../api/carts';

type Props = {
  _id: string,
  image: string,
  price: number,
  title: string,
  isConfigurable: boolean,
  configurable: Object[],
};

const Product = (props: Props) => {
  const previewStype = {
    backgroundImage: `url(${props.image})`,
  };

  const productLink = `/product/${props._id}`;

  const onClickAddButton = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget;
    button.disabled = true;

    const finish = () => {
      button.disabled = false;
    };

    carts.add(props._id).then(() => {
      NotificationBox.success('Added to cart');
      finish();
    }).catch((error) => {
      NotificationBox.danger(error.message);
      finish();
    });
  };

  return (
    <Link
      className="Product"
      to={productLink}
    >
      <div
        className="prvw"
        style={previewStype}
      >
        {!props.isConfigurable || props.configurable.length < 2
          ? (
            <div className="actn">
              <button
                className="btn btn-light animated pulse"
                type="button"
                onClick={onClickAddButton}
              >
                {tt('Add to cart')}
              </button>
            </div>
          )
          : null
        }
      </div>
      <div className="nm">{props.title}</div>
      <div className="prc">{NumberFormat(props.price)}</div>
    </Link>
  );
};

export default Product;
