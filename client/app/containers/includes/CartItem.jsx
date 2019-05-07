// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import NumberInput from 'tl-react-numeric-input';
import { tt } from '../../components/TranslateElement';
import carts from '../../api/carts';

type Props = Object;

type State = {
  quantity: number,
};

class CartItem extends React.PureComponent<Props, State> {
  inputChangeTimer: ?TimeoutID = null;

  prevQuantity: number;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    const pureQuantity = props.quantity;
    this.prevQuantity = pureQuantity;

    this.state = {
      quantity: pureQuantity,
    };

    const self: any = this;
    self.onChangeQuantityInput = this.onChangeQuantityInput.bind(this);
    self.onClickDeleteButton = this.onClickDeleteButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onChangeQuantityInput(event: SyntheticEvent<HTMLInputElement>, value: ?number) {
    const pureValue = parseInt(value) || 0;
    const diff = pureValue - this.prevQuantity;
    this.prevQuantity = pureValue;

    this.setStateAfterInputChange({
      quantity: pureValue,
    });
  }

  onClickDeleteButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;

    showConfirmModal('Are you sure?', () => {
      button.disabled = true;
      const productId = this.props._id;
      console.log(productId);

      /*
      orders.remove(productId).then(() => {
        button.disabled = false;
        const productData = Object.assign({}, this.props, this.state);
        delete productData.onChangeTotalDiff;
        delete productData.onDelete;

        this.props.onDelete(productData);
      }).catch((error) => {
        button.disabled = false;
        NotificationBox.danger(error.message);
      });
      */
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
      price,
      productId,
    } = this.props;

    const {
      quantity,
    } = this.state;

    console.log(quantity);
    const toPath = `/product/${productId}`;

    return (
      <div className="CartItem">
        <div className="row">
          <Link
            className="col-sm-3"
            to={toPath}
          >
            <img
              alt="thumb_image"
              className="img-fluid"
              src={image}
            />
          </Link>
          <div className="col-sm-9">
            <div className="ttl">{title}</div>
            <div className="row">
              <div className="col-sm-4">
                <div className="form-group">
                  <label>
                    {tt('Quantity')}
                    :
                  </label>
                  <NumberInput
                    disableDecimal
                    defaultValue={quantity}
                    min={1}
                    onChange={this.onChangeQuantityInput}
                  />
                </div>
              </div>
              <div className="col-sm-8">
                <div className="prc">{NumberFormat(price)}</div>
                <div className="prc">
                  {`Total: ${NumberFormat(quantity * price)}`}
                </div>
              </div>
            </div>
            <button
              className="btn btn-danger btn-sm float-right"
              type="button"
              onClick={this.onClickDeleteButton}
            >
              {tt('Delete')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CartItem;
