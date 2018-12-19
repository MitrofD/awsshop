// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import { tt } from '../components/TranslateElement';
import AlertDanger from '../components/alerts/AlertDanger';
import products from '../api/products';
import user from '../api/user';

type Props = {
  id: string,
  history: Object,
};

type State = {
  alert: ?React$Element<typeof AlertDanger>,
  currTab: string,
  xhrRequest: boolean,
};

const tabs = {
  desc: 'description',
  shppng: 'shipping',
};

const firstTab = Object.keys(tabs)[0];

class Product extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      alert: null,
      currTab: firstTab,
      xhrRequest: true,
    };

    const self: any = this;
    self.onClickTabItem = this.onClickTabItem.bind(this);
    self.onClickAddToCartButton = this.onClickAddToCartButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const finishWithState = (newState: Object) => {
      if (this.unmounted) {
        return;
      }

      const pureNewState = Object.assign({
        xhrRequest: false,
      }, newState);

      this.setState(pureNewState);
    };

    products.getById(this.props.id).then((data) => {
      this.data = data;
      finishWithState({});
    }).catch(() => {
      finishWithState({
        alert: <AlertDanger>Product has been deleted or set on pause by owners</AlertDanger>,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickTabItem(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    const { tab } = event.currentTarget.dataset;

    if (!Tools.has.call(tabs, tab)) {
      throw new Error(`Tab "${tab}" not available`);
    }

    this.setState({
      currTab: tab,
    });
  }

  onClickAddToCartButton(event: SyntheticEvent<HTMLButtonElement>) {
    const {
      history,
      id,
    } = this.props;

    const currUser = user.get();

    if (!currUser) {
      history.push('/login');
      return;
    }

    const button = event.currentTarget;
    button.disabled = true;

    products.addToCart(id).then(() => {
      NotificationBox.success('Added to Cart successful');
      button.disabled = false;
    }).catch((error) => {
      NotificationBox.danger(error.message);
      button.disabled = false;
    });
  }

  data: ?Object = null;
  unmounted = true;

  render() {
    const {
      alert,
      currTab,
      xhrRequest,
    } = this.state;

    let content = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else if (this.data) {
      const pData = this.data;
      const tabKeys = Object.keys(tabs);

      content = (
        <div className="row">
          <div className="col-sm-4">
            <img
              alt="main_img"
              className="img-thumbnail"
              src={pData.image}
            />
          </div>
          <div className="col-md-8">
            <div className="ttl">{pData.title}</div>
            <div className="row">
              <div className="prc col-sm-9">ETH {pData.price}</div>
              <div className="col-sm-3">
                <button
                  className="btn btn-primary btn-block animated pulse"
                  onClick={this.onClickAddToCartButton}
                >
                  {tt('Add to cart')}
                </button>
              </div>
            </div>
            <div className="thmbs">
              {pData.images.map((image, idx) => {
                let key = `img_${idx}`;

                return (
                  <div
                    className="itm"
                    key={key}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                );
              })}
            </div>
          </div>
          <div className="tabs col-sm-12">
            <ul className="nav nav-tabs">
              {tabKeys.map((tabKey) => {
                const tabTitle = tabs[tabKey];
                let tabItemCN = 'nav-link';

                if (currTab === tabKey) {
                  tabItemCN += ' active';
                }

                return (
                  <li
                    className="nav-item"
                    key={tabKey}
                  >
                    <a
                      className={tabItemCN}
                      data-tab={tabKey}
                      onClick={this.onClickTabItem}
                      href="#!"
                    >
                      {tabTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className={`tab-content ${currTab}`}>
              <div
                className="itm desc"
                dangerouslySetInnerHTML={{ __html: pData.description }}
              />
              <div
                className="itm shppng"
                dangerouslySetInnerHTML={{ __html: pData.shipping }}
              />
            </div>
          </div>
        </div>
      );
    }

    return (
      <Page className="ProductPage sp">
        {alert}
        {content}
      </Page>
    );
  }
}

export default asHOT(module)(withRouter(Product));
