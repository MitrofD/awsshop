// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';
import { PrimaryBadge } from '../../../components/Badge';
import products from '../../../api/products';

type Props = {
  user: ?Object,
};

type State = {
  productsCount: number,
};

class ShoppingCart extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    if (props.user) {
      this.toPath = '/shopping-cart';
    }

    this.state = {
      productsCount: products.getProductsCount(),
    };
  }

  componentDidMount() {
    this.unmounted = false;

    this.productsCountSubs = products.subscribeToProductsCount((productsCount) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        productsCount,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.productsCountSubs) {
      this.productsCountSubs.stop();
      this.productsCountSubs = null;
    }
  }

  toPath = '/login';
  productsCountSubs: ?SubscribeHandler = null;
  unmounted = true;

  render() {
    return (
      <li className="nav-item">
        <Link
          className="nav-link brdrd ShoppingCart"
          to={this.toPath}
        >
          <div className="icn-wrppr">
            <i className="icn icn-shppng-crt" /> {tt('Shopping cart')}
            <PrimaryBadge>{this.state.productsCount}</PrimaryBadge>
          </div>
        </Link>
      </li>
    );
  }
}

export default ShoppingCart;
