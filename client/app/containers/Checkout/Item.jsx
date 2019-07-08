// @flow
import React from 'react';
import NumberInput from 'tl-react-numeric-input';
import carts from '../../api/carts';

type Props = Object;

type State = Object;

const getPrice = (productInfo: Object) => {
  const price = productInfo.options && productInfo.options.isConfigurable ? productInfo.options.price : productInfo.price;

  return price;
};

class Item extends React.Component<Props, State> {
  inputChangeTimer: ?TimeoutID = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      quantity: props.quantity,
    };

    const self: any = this;
    self.onClickDecrementCount = this.onClickDecrementCount.bind(this);
    self.onChangeCount = this.onChangeCount.bind(this);
    self.onClickIncrementCount = this.onClickIncrementCount.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onClickDecrementCount() {
    const { quantity } = this.props;
    const incrQuantity = quantity - 1;

    carts.update(this.props._id, incrQuantity).then((data) => {
      this.setStateAfterInputChange({
        quantity: data.quantity,
      });
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  onChangeCount(event: SyntheticEvent<HTMLInputElement>) {
    const pureValue = parseInt(event.currentTarget.value) || 0;

    if (event.currentTarget.value === '0') {
      NotificationBox.danger('Quantity has to be greater than zero');
    }

    if (!pureValue) {
      return;
    }

    const options = {
      quantity: pureValue,
    };

    carts.update(this.props._id, pureValue).then((data) => {
      this.setState({
        quantity: data.quantity,
      });
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  onClickIncrementCount() {
    const { quantity } = this.props;
    const decQuantity = quantity + 1;

    carts.update(this.props._id, decQuantity).then((data) => {
      this.setStateAfterInputChange({
        quantity: data.quantity,
      });
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  setStateAfterInputChange(newState: Object) {
    this.stopInputChangeTimer();

    this.inputChangeTimer = setTimeout(() => {
      this.setState(newState);
    }, Config.inputTimeout);
  }

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  render() {
    const {
      image,
      title,
      quantity,
    } = this.props;

    return (
      <tr>
        <td><div className="img"><img src={image} alt="" /></div></td>
        <td>{title}</td>
        <td>
          <div className="btn-group quantity">
            <span className="btn" onClick={this.onClickDecrementCount} role="presentation">-</span>
            <NumberInput
              className="btn"
              disabledDecimal
              value={this.state.quantity}
              defaultValue={quantity}
              min="1"
              onChange={this.onChangeCount}
            />
            <span className="btn" onClick={this.onClickIncrementCount} role="presentation">+</span>
          </div>
          <a href="#" className="delete" />
        </td>
        <td><strong>{NumberFormat(quantity * getPrice(this.props))}</strong></td>
      </tr>
    );
  }
}

export default Item;
