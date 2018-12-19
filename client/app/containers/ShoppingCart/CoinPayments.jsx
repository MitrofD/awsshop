// @flow
import React from 'react';

type Props = {
  amount: number,
};

type State = {
  amount: number,
};

const defaultProps = {
  amount: 0,
};

class CoinPayments extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      amount: props.amount,
    };

    const self: any = this;
    self.setAmount = this.setAmount.bind(this);
  }

  setAmount(amount: number) {
    this.setState({
      amount,
    });
  }

  render() {
    if (this.state.amount > 0) {
      return (
        <div className="CoinPayments">
          <form
            action="https://www.coinpayments.net/index.php"
            method="POST"
          >
            <input
              type="hidden"
              name="cmd"
              defaultValue="_pay"
            />
            <input
              type="hidden"
              name="reset"
              defaultValue="1"
            />
            <input
              type="hidden"
              name="merchant"
              defaultValue={Config.coinPaymentsId}
            />
            <input
              type="hidden"
              name="item_name"
              defaultValue={`Products from ${Config.name}`}
            />
            <input
              type="hidden"
              name="currency"
              defaultValue="ETH"
            />
            <input
              type="hidden"
              name="amountf"
              value={this.state.amount}
            />
            <input
              type="hidden"
              name="quantity"
              defaultValue="1"
            />
            <input
              type="hidden"
              name="allow_quantity"
              defaultValue="0"
            />
            <input
              type="hidden"
              name="want_shipping"
              defaultValue="1"
            />
            <input
              type="hidden"
              name="success_url"
              defaultValue={`${Config.url}/orders-complete`}
            />
            <input
              type="hidden"
              name="cancel_url"
              defaultValue={`${Config.url}/shopping-cart`}
            />
            <input
              type="hidden"
              name="allow_extra"
              defaultValue="1"
            />
            <input
              alt="Buy_Now_with_CoinPayments.net"
              type="image"
              src="https://www.coinpayments.net/images/pub/buynow-wide-yellow.png"
            />
          </form>
        </div>
      );
    }

    return null;
  }
}

export default CoinPayments;
