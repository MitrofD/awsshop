// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';
import CoinPayments from './CoinPayments';
import Item from './Item';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';
import NoHaveLabel from '../includes/NoHaveLabel';
import carts from '../../api/carts';

type Props = {};

type State = Object;

class Cart extends React.PureComponent<Props, State> {
  unmounted = true;

  coinPaymentsRef: CoinPayments;

  totalPriceRef: HTMLElement;

  infoSubs: ?SubscribeHandler = null;

  constructor(props: Props, context: null) {
    super(props, context);
    this.state = carts.getInfo();

    const self: any = this;
    self.setCoinPaymentsRef = this.setCoinPaymentsRef.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    this.infoSubs = carts.subsToInfo((info) => {
      if (this.unmounted) {
        return;
      }

      this.setState(info);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.infoSubs) {
      this.infoSubs.stop();
      this.infoSubs = null;
    }
  }

  setCoinPaymentsRef(el: ?CoinPayments) {
    if (el) {
      this.coinPaymentsRef = el;
    }
  }

  render() {
    const {
      items,
      summ,
    } = this.state;

    let itemsContent = null;

    if (items.length > 0) {
      itemsContent = items.map(item => (
        <Item
          {...item}
          key={item._id}
        />
      ));
    } else {
      itemsContent = <NoHaveLabel>{tt('Your shopping cart is empty')}</NoHaveLabel>;
    }

    return (
      <Page className="Cart sp">
        <div className="row ldr-hddn">
          <div className="ttl col-sm-12">{tt('Shopping cart')}</div>
          <div className="col-sm-9">
            {itemsContent}
          </div>
          <div className="col-sm-3">
            <div className="smmry">
              <div className="ttl">{tt('Cart summary')}</div>
              <div className="prc">
                <span>{NumberFormat(summ)}</span>
              </div>
            </div>
            <div className="spprt">
              <div className="ttl">{tt('Continue shopping')}</div>
              <p> If you have a question, please contact us</p>
              <p className="text-right">
                <Link
                  className="btn btn-sm btn-primary"
                  to="/support"
                >
                  {tt('Contact support')}
                </Link>
              </p>
              {items.length !== 0
                ? (
                  <p>
                    <Link
                      className="btn btn-sm btn-success btn-block"
                      to="/checkout"
                    >
                      {tt('Checkout')}
                    </Link>
                  </p>
                )
                : null
              }
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

export default hot(Cart);
