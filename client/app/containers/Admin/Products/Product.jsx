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
    self.onClickApproveButton = this.onClickApproveButton.bind(this);
  }

  onClickDeleteButton() {
    this.props.onDelete(this.state);
  }

  onClickApproveButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    button.disabled = true;
    const newIsApprovedValue = !this.state.isApproved;

    products.setApprove(this.state._id, newIsApprovedValue).then(() => {
      button.disabled = false;

      this.setState({
        isApproved: newIsApprovedValue,
      });
    }).catch((error) => {
      button.disabled = false;
      NotificationBox.danger(error.message);
    });
  }

  render() {
    const {
      advData,
      earnings,
      title,
      image,
      isApproved,
      price,
    } = this.state;

    const approveButtonTitle = isApproved ? 'Unapprove' : 'Approve';

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
            <div className="my-3">
              <strong>{tt('User')}: </strong>
              {advData.userFullName}
              <br />
              <strong>{tt('User email')}: </strong>
              <a href={`mailto:${advData.userEmail}`}>{advData.userEmail}</a>
            </div>
            <div className="my-3">
              <strong>{tt('Price')}:</strong> {price} $
              <br />
              <strong>{tt('Earnings')}:</strong> {earnings} $
            </div>
            <div className="btns-grp float-right">
              <button
                className="btn btn-primary btn-sm"
                onClick={this.onClickApproveButton}
                type="button"
              >
                {tt(approveButtonTitle)}
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
