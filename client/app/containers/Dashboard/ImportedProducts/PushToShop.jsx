// @flow
import React from 'react';
import EditProduct from '../includes/EditProduct';
import { tt } from '../../../components/TranslateElement';

type Props = Object & {
  onCancel: Function,
  onPush: (Object) => void,
};

class PushToShop extends React.PureComponent<Props> {
  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onSaveProduct = this.onSaveProduct.bind(this);
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.props.onCancel();
  }

  onSaveProduct(product: Object) {
    NotificationBox.success('Product has been pushed');
    this.props.onPush(product);
  }

  render() {
    return (
      <div className="PushToShop">
        <div className="ttl">
          {tt('Push to shop')}
          <div className="inf">
            <a
              className="to-bck icn-wrppr"
              href="#!"
              onClick={this.onClickCancelButton}
            >
              <i className="icn icn-lng-lft-arrw" />
              {' '}
              {tt('Go back')}
            </a>
          </div>
        </div>
        <EditProduct
          isRaw
          {...this.props}
          goToBack={this.onClickCancelButton}
          onSave={this.onSaveProduct}
        />
      </div>
    );
  }
}

export default PushToShop;
