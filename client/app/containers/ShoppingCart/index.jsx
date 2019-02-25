// @flow
import React from 'react';
import CoinPayments from './CoinPayments';
import Item from './Item';
import AlertDanger from '../../components/alerts/AlertDanger';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';
import XHRSpin from '../includes/XHRSpin';
import NoHaveLabel from '../includes/NoHaveLabel';
import orders from '../../api/orders';

type Props = {};

type State = {
  alert: ?React$Element<typeof AlertDanger>,
  xhrRequest: boolean,
};

class ShoppingCart extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      alert: null,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeItemTotalDiff = this.onChangeItemTotalDiff.bind(this);
    self.onDeleteProduct = this.onDeleteProduct.bind(this);
    self.setCoinPaymentsRef = this.setCoinPaymentsRef.bind(this);
    self.setTotalPriceRef = this.setTotalPriceRef.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const setStateAfterRequest = (newState: Object) => {
      if (this.unmounted) {
        return;
      }

      const pureNewState = Object.assign({
        xhrRequest: false,
      }, newState);

      this.setState(pureNewState);
    };

    let totalPrice = 0;

    orders.getCart().then((items) => {
      this.items = items.map((item) => {
        const itemId = item._id;
        this.itemIds.push(itemId);
        const itemTotal = item.count * item.price;
        totalPrice += itemTotal;

        return (
          <Item
            {...item}
            key={itemId}
            onChangeTotalDiff={this.onChangeItemTotalDiff}
            onDelete={this.onDeleteProduct}
          />
        );
      });

      setStateAfterRequest({});
      this.setTotalPrice(totalPrice);
    }).catch((error) => {
      setStateAfterRequest({
        alert: <AlertDanger>{error.message}</AlertDanger>,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onChangeItemTotalDiff(id: string, diff: number) {
    this.setTotalPrice(this.totalPrice + diff);
  }

  onDeleteProduct(product: Object) {
    const idx = this.itemIds.indexOf(product._id);

    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.itemIds.splice(idx, 1);
      this.forceUpdate();
      const productCount = parseInt(product.count) || 0;
      const productTotalPrice = productCount * product.price;
      this.setTotalPrice(this.totalPrice - productTotalPrice);
    }
  }

  setTotalPrice(newPrice: number) {
    this.totalPrice = newPrice;
    const purePrice = this.totalPrice > 0 ? this.totalPrice : 0;
    this.totalPriceRef.innerHTML = NumberFormat(purePrice);
    this.coinPaymentsRef.setAmount(purePrice);
  }

  setCoinPaymentsRef(el: ?CoinPayments) {
    if (el) {
      this.coinPaymentsRef = el;
    }
  }

  setTotalPriceRef(el: ?HTMLElement) {
    if (el) {
      this.totalPriceRef = el;
    }
  }

  coinPaymentsRef: CoinPayments;
  items: React$Element<typeof Item>[] = [];
  itemIds: string[] = [];
  totalPrice: number = 0;
  totalPriceRef: HTMLElement;
  unmounted = true;

  render() {
    let loader = null;
    let className = 'ShoppingCart sp';

    if (this.state.xhrRequest) {
      loader = <XHRSpin />;
      className += ' ldr-md';
    }

    const itemsContent = this.items.length > 0 ? this.items : <NoHaveLabel>{tt('Your shopping cart is empty')}</NoHaveLabel>;

    return (
      <Page className={className}>
        {loader}
        <div className="row ldr-hddn">
          <div className="ttl col-sm-12">{tt('Shopping cart')}</div>
          <div className="col-sm-9">{itemsContent}</div>
          <div className="col-sm-3">
            <div className="smmry">
              <div className="ttl">{tt('Cart summary')}</div>
              <div className="prc">
                <span ref={this.setTotalPriceRef} />
              </div>
              <CoinPayments ref={this.setCoinPaymentsRef} />
            </div>
            <div className="spprt">
              <div className="ttl">{tt('Continue shopping')}</div>
              <p>{tt('Please contact with us if you have any questions')}</p>
              <a
                className="btn btn-sm btn-primary float-right"
                href={`mailto:${Config.supportEmail}`}
              >
                {tt('Contact support')}
              </a>
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

export default asHOT(module)(ShoppingCart);
