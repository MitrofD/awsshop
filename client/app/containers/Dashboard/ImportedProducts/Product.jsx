// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';
import products from '../../../api/products';

type Props = {
  data: Object,
  onClickPushButton: (data: Object) => void,
};

type State = {
  data: Object,
  modal: React$Node,
};

class Product extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      data: props.data,
      modal: null,
    };

    const self: any = this;
    self.onClickPushToShop = this.onClickPushToShop.bind(this);
  }

  onClickPushToShop() {
    this.props.onClickPushButton(this.state.data);
  }

  render() {
    const {
      data,
      modal,
    } = this.state;

    return (
      <div className="Product col-sm-12 col-md-6">
        {modal}
        <div className="row">
          <div className="col-md-5">
            <img
              alt={data.title}
              className="img-thumbnail"
              src={data.image}
            />
          </div>
          <div className="col-md-7">
            <p>{data.title}</p>
            <button
              className="btn btn-primary btn-sm float-right"
              onClick={this.onClickPushToShop}
              type="button"
            >
              {tt('Push to Shop')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default Product;
