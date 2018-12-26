// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';
import { PrimaryBadge } from '../../../components/Badge';
import orders from '../../../api/orders';

type Props = {
  user: ?Object,
};

type State = {
  ordersCount: number,
};

class ShoppingCart extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    if (props.user) {
      this.toPath = '/shopping-cart';
    }

    this.state = {
      ordersCount: orders.getProductsCount(),
    };
  }

  componentDidMount() {
    this.unmounted = false;

    this.ordersCountSubs = orders.subscribeToCount((ordersCount) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        ordersCount,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.ordersCountSubs) {
      this.ordersCountSubs.stop();
      this.ordersCountSubs = null;
    }
  }

  toPath = '/login';
  ordersCountSubs: ?SubscribeHandler = null;
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
            <PrimaryBadge>{this.state.ordersCount}</PrimaryBadge>
          </div>
        </Link>
      </li>
    );
  }
}

export default ShoppingCart;
