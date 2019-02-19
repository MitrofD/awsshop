// @flow
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';
import orders from '../../../api/orders';
import user from '../../../api/user';

type Props = {
  _id: string,
  history: Object,
  image: string,
  price: number,
  title: string,
};

const Product = (props: Props) => {
  const previewStype = {
    backgroundImage: `url(${props.image})`,
  };

  const productLink = `/product/${props._id}`;

  const onClickAddButton = (event: SyntheticEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const currUser = user.get();

    if (!currUser) {
      props.history.push('/login');
      return;
    }

    const button = event.currentTarget;
    button.disabled = true;

    orders.add(props._id).then(() => {
      NotificationBox.success('Added to Cart successful');
      button.disabled = false;
    }).catch((error) => {
      NotificationBox.danger(error.message);
      button.disabled = false;
    });
  };

  return (
    <Link
      className="Product col-md-3"
      to={productLink}
    >
      <div
        className="prvw"
        style={previewStype}
      >
        <div className="actn">
          <button
            className="btn btn-light animated pulse"
            onClick={onClickAddButton}
          >
            {tt('Add to cart')}
          </button>
        </div>
      </div>
      <div className="nm">{props.title}</div>
      <div className="prc">{props.price} $</div>
    </Link>
  );
};

export default withRouter(Product);
