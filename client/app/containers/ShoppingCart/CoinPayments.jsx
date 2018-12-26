// @flow
import React from 'react';
import orders from '../../api/orders';
import user from '../../api/user';

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

    const currUser = user.get();

    if (currUser) {
      this.userEmail = currUser.email;
    }

    const self: any = this;
    self.setAmount = this.setAmount.bind(this);
    self.onClickButton = this.onClickButton.bind(this);
    self.setDescriptionInputRef = this.setDescriptionInputRef.bind(this);
    self.setFormRef = this.setFormRef.bind(this);
    self.setSuccessURLInputRef = this.setSuccessURLInputRef.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    button.disabled = true;

    orders.genOrderId().then((orderId) => {
      this.descriptionInputRef.value = `Order ID: ${orderId}.From ${Config.url}`;
      this.successURLInputRef.value = `${Config.url}/orders-completed/${orderId}`;
      this.formRef.submit();
    }).catch((error) => {
      button.disabled = false;
      NotificationBox.danger(error.message);
    });
  }

  setAmount(amount: number) {
    this.setState({
      amount,
    });
  }

  setDescriptionInputRef(el: ?HTMLInputElement) {
    if (el) {
      this.descriptionInputRef = el;
    }
  }

  setFormRef(el: ?HTMLFormElement) {
    if (el) {
      this.formRef = el;
    }
  }

  setSuccessURLInputRef(el: ?HTMLInputElement) {
    if (el) {
      this.successURLInputRef = el;
    }
  }

  descriptionInputRef: HTMLInputElement;
  formRef: HTMLFormElement;
  successURLInputRef: HTMLInputElement;
  unmounted = true;
  userEmail = '';

  render() {
    if (this.state.amount > 0) {
      return (
        <div className="CoinPayments">
          <form
            action="https://www.coinpayments.net/index.php"
            method="POST"
            ref={this.setFormRef}
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
              name="email"
              defaultValue={this.userEmail}
            />
            <input
              type="hidden"
              name="merchant"
              defaultValue={Config.coinPaymentsId}
            />
            <input
              type="hidden"
              name="item_name"
              ref={this.setDescriptionInputRef}
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
              ref={this.setSuccessURLInputRef}
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
            <button onClick={this.onClickButton} />
          </form>
        </div>
      );
    }

    return null;
  }
}

export default CoinPayments;
