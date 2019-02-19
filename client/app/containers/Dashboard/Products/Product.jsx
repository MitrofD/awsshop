// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';
import products from '../../../api/products';

type Props = {
  data: Object,
  onDelete: (data: Object) => void,
};

type State = Object;

class Product extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    this.state = props.data;

    const self: any = this;
    self.onClickDeleteButton = this.onClickDeleteButton.bind(this);
    self.onClickPauseButton = this.onClickPauseButton.bind(this);
  }

  onClickDeleteButton() {
    this.props.onDelete(this.state);
  }

  onClickPauseButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    button.disabled = true;
    const newIsPausedValue = !this.state.isPaused;

    products.setPause(this.state._id, newIsPausedValue).then(() => {
      button.disabled = false;

      this.setState({
        isPaused: newIsPausedValue,
      });
    }).catch((error) => {
      button.disabled = false;
      NotificationBox.danger(error.message);
    });
  }

  render() {
    const {
      earnings,
      title,
      image,
      isApproved,
      isPaused,
      price,
    } = this.state;

    const pauseButtonTitle = isPaused ? 'Unpause' : 'Pause';
    let approveCN = 'apprvd al';
    let approveText = 'Is approved';

    if (!isApproved) {
      approveCN = `nt-${approveCN}`;
      approveText = 'Waiting for approve';
    }

    return (
      <div className="Product col-lg-8">
        <div className="row">
          <div className="col-md-5">
            <img
              alt="main_image"
              className="img-thumbnail"
              src={image}
            />
          </div>
          <div className="col-md-7 mt-3 mt-sm-0">
            {title}
            <div className={approveCN}>{approveText}</div>
            <p className="prc">
              {tt('Price')}: {price} $
              <br />
              {tt('Earnings')}: {earnings} $
            </p>
            <div className="btns-grp float-right">
              <button
                className="btn btn-primary btn-sm"
                onClick={this.onClickPauseButton}
                type="button"
              >
                {tt(pauseButtonTitle)}
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={this.onClickDeleteButton}
                type="button"
              >
                {tt('Delete')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
