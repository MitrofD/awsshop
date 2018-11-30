// @flow
import React from 'react';
import EditProduct from '../includes/EditProduct';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import data from '../../../api/data';

type Props = Object;

class EditOrPush extends React.PureComponent<Props> {
  constructor(props: Props, context: null) {
    super(props, context);

    const self: any = this;
    self.onClickGoToBackButton = this.onClickGoToBackButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const setPriceFromRequest = (price: any) => {
      if (this.unmounted) {
        return;
      }

      this.ethPrice = price;
      this.forceUpdate();
    };

    data.getETHPrice().then(setPriceFromRequest).catch(() => {
      setPriceFromRequest(0);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickGoToBackButton(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.props.onClickCancelButton();
  }

  ethPrice: any = null;
  unmounted = true;

  render() {
    let content = null;

    if (this.ethPrice !== null) {
      content = (
        <EditProduct
          {...this.props}
          ethPrice={this.ethPrice}
        />
      );
    } else {
      content = <XHRSpin />;
    }

    return (
      <div className="EditOrPush">
        <div className="ttl">
          {tt('Push to shop or edit')}
          <div className="inf">
            <a
              className="to-bck icn-wrppr"
              href="#!"
              onClick={this.onClickGoToBackButton}
            >
              <i className="icn icn-lng-lft-arrw" /> {tt('Go to back')}
            </a>
          </div>
        </div>
        {content}
      </div>
    );
  }
}

export default EditOrPush;
