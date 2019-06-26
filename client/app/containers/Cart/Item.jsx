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

class Item extends React.PureComponent<Props, State> {
  inputChangeTimer: ?TimeoutID = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      quantity: props.quantity,
    };

    const self: any = this;
    self.onSetQuantityInput = this.onSetQuantityInput.bind(this);
    self.onClickDeleteButton = this.onClickDeleteButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onSetQuantityInput(input: NumberInput) {
    const pureValue = parseInt(input.value) || 0;

    this.setStateAfterInputChange({
      quantity: pureValue,
    });
  }

  onClickDeleteButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;

    showConfirmModal('Are you sure?', () => {
      button.disabled = true;
      const productId = this.props._id;

      carts.delete(productId).catch((error) => {
        button.disabled = false;
        NotificationBox.danger(error.message);
      });
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
      productId,
    } = this.props;
    const price = this.props.options.isConfigurable ? this.props.options.price : this.props.price;

    const {
      quantity,
    } = this.state;

    const toPath = `/product/${productId}`;

    return (
      <div className="row Item">
        <Link
          className="col-sm-3"
          to={toPath}
        >
          <img
            alt="thumb_image"
            className="img-thumbnail"
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
                  className="form-control"
                  disabledDecimal
                  defaultValue={quantity}
                  min="1"
                  onSet={this.onSetQuantityInput}
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
    );
  }
}

export default Item;
