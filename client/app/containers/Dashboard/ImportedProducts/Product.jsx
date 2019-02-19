// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';
import products from '../../../api/products';

type ItemManipulation = (data: Object) => void;

type Props = {
  data: Object,
  onDelete: ItemManipulation,
  onPush: ItemManipulation,
};

type State = Object;

class Product extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    this.state = props.data;

    const self: any = this;
    self.onClickDeleteButton = this.onClickDeleteButton.bind(this);
    self.onClickPushButton = this.onClickPushButton.bind(this);
  }

  onClickDeleteButton() {
    this.props.onDelete(this.state);
  }

  onClickPushButton() {
    this.props.onPush(this.state);
  }

  render() {
    const {
      title,
      image,
    } = this.state;

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
          <div className="col-md-7">
            <p>{title}</p>
            <div className="btns-grp float-right">
              <button
                className="btn btn-primary btn-sm"
                onClick={this.onClickPushButton}
                type="button"
              >
                {tt('Push to Shop')}
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
