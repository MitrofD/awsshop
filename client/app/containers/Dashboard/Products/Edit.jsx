// @flow
import React from 'react';
import EditProduct from '../includes/EditProduct';
import { tt } from '../../../components/TranslateElement';

type Props = Object & {
  onCancel: Function,
  onUpdate: (Object) => void,
};

class Edit extends React.PureComponent<Props> {
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
    NotificationBox.success('Product has been updated');
    this.props.onUpdate(product);
  }

  render() {
    return (
      <div className="Edit">
        <div className="ttl">
          {tt('Edit product')}
          <div className="inf">
            <a
              className="to-bck icn-wrppr"
              href="#!"
              onClick={this.onClickCancelButton}
            >
              <i className="icn icn-lng-lft-arrw" />
              {' '}
              {tt('Go to back')}
            </a>
          </div>
        </div>
        <EditProduct
          {...this.props}
          goToBack={this.onClickCancelButton}
          onSave={this.onSaveProduct}
        />
      </div>
    );
  }
}

export default Edit;
