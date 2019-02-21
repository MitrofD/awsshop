// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import NumberInput from '../../components/NumberInput';
import { tt } from '../../components/TranslateElement';
import orders from '../../api/orders';

type Props = Object & {
  onChangeTotalDiff: (string, number) => void,
  onDelete: (Object) => void,
};

type State = {
  count: number,
};

class Item extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    const pureCount = parseInt(props.count) || 0;
    this.prevCount = pureCount;

    this.state = {
      count: pureCount,
    };

    const self: any = this;
    self.onChangeCountInput = this.onChangeCountInput.bind(this);
    self.onClickDeleteButton = this.onClickDeleteButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onChangeCountInput(event: SyntheticEvent<HTMLInputElement>, value: ?number) {
    const pureValue = parseInt(value) || 0;
    const diff = pureValue - this.prevCount;
    this.prevCount = pureValue;
    this.props.onChangeTotalDiff(this.props._id, diff * this.props.price);

    this.setStateAfterInputChange({
      count: pureValue,
    });
  }

  onClickDeleteButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;

    showConfirmModal('Are you sure?', () => {
      button.disabled = true;
      const productId = this.props._id;

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

  inputChangeTimer: ?TimeoutID = null;
  prevCount: number;
  unmounted = true;

  render() {
    const {
      image,
      title,
      price,
      productId,
    } = this.props;

    const {
      count,
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
                <label>{tt('Quantity')}:</label>
                <NumberInput
                  disableDecimal
                  defaultValue={count}
                  min={0}
                  onChange={this.onChangeCountInput}
                />
              </div>
            </div>
            <div className="col-sm-8">
              <div className="prc">{NumberFormat(price)} $</div>
              {count > 0 && <div className="prc">Total: {NumberFormat(count * price)} $</div>}
            </div>
          </div>
          <button
            className="btn btn-danger btn-sm float-right"
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
