// @flow
import React from 'react';
import Drift from 'drift-zoom';
import NumericInput from 'tl-react-numeric-input';
import { tns } from 'tiny-slider/src/tiny-slider';
import 'drift-zoom/src/css/drift-basic.css';
import Page from './includes/Page';
import XHRSpin from './includes/XHRSpin';
import { tt } from '../components/TranslateElement';
import AlertDanger from '../components/alerts/AlertDanger';
import carts from '../api/carts';
import products from '../api/products';
import tools from '../api/tools';

type Props = {
  id: string,
};

type State = {
  alert: ?React$Element<typeof AlertDanger>,
  currImgIdx: number,
  currTab: string,
  quantity: ?string,
  xhrRequest: boolean,
};

const defQuantity = '1';

const tabs = {
  desc: 'description',
  shppng: 'shipping',
};

const firstTab = Object.keys(tabs)[0];

class Product extends React.PureComponent<Props, State> {
  mainImgSrc: ?string = null;

  mainImgClassName = 'img-thumbnail mb-3';

  data: ?Object = null;

  driftBox: ?Object;

  driftPaneContainerId: string;

  mainImgRef: HTMLElement;

  imagesSlider: ?Object;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      alert: null,
      currImgIdx: 0,
      currTab: firstTab,
      quantity: defQuantity,
      xhrRequest: true,
    };

    this.driftPaneContainerId = `${tools.escapedString('driftPane')}_${Date.now()}`;

    const self: any = this;
    self.onClickTabItem = this.onClickTabItem.bind(this);
    self.onClickAddToCartButton = this.onClickAddToCartButton.bind(this);
    self.onClickToThumbImage = this.onClickToThumbImage.bind(this);
    self.onSetQuantityInput = this.onSetQuantityInput.bind(this);
    self.onRefMainImg = this.onRefMainImg.bind(this);
    self.onRefImagesSlider = this.onRefImagesSlider.bind(this);
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
      this.mainImgSrc = data.image;
      finishWithState({});
    }).catch(() => {
      finishWithState({
        alert: <AlertDanger>Product not found or has been deleted by owners</AlertDanger>,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.destroyImagesSliderIfNeeded();

    if (this.driftBox) {
      this.driftBox.destroy();
      this.driftBox = null;
    }
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
    const button = event.currentTarget;
    const quantity = parseInt(this.state.quantity) || defQuantity;
    button.disabled = true;

    carts.add(this.props.id, {
      quantity,
    }).then(() => {
      NotificationBox.success('Added to cart');
      button.disabled = false;
    }).catch((error) => {
      NotificationBox.danger(error.message);
      button.disabled = false;
    });
  }

  onClickToThumbImage(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const pData = Tools.anyAsObj(this.data);
    const imageFullSrc = element.style.backgroundImage.substr(5);

    const [
      imageSrc,
    ] = imageFullSrc.split('_50x50');

    this.mainImgSrc = imageSrc;
    this.mainImgRef.className = this.mainImgClassName;

    setImmediate(() => {
      this.mainImgRef.className = `${this.mainImgClassName} animated pulse`;
    });

    const idx = parseInt(element.dataset.idx);

    this.setState({
      currImgIdx: idx,
    });
  }

  onSetQuantityInput(input: NumericInput) {
    const quantity = input.value > 0 ? input.value.toString() : null;

    this.setState({
      quantity,
    });
  }

  onRefMainImg(mbEl: ?HTMLElement) {
    if (mbEl) {
      this.mainImgRef = mbEl;

      this.driftBox = new Drift(this.mainImgRef, {
        paneContainer: document.getElementById(this.driftPaneContainerId),
        inlinePane: false,
      });
    }
  }

  onRefImagesSlider(mbEl: ?HTMLElement) {
    this.destroyImagesSliderIfNeeded();

    if (mbEl) {
      this.imagesSlider = tns({
        container: mbEl,
        loop: false,
        items: 5,
        controlsText: ['', ''],
        controls: true,
        nav: false,
        controlsPosition: 'bottom',
        slideBy: 'page',
        gutter: 14,
        autoplay: false,
      });
    }
  }

  destroyImagesSliderIfNeeded() {
    if (this.imagesSlider) {
      this.imagesSlider.destroy();
      this.imagesSlider = null;
    }
  }

  render() {
    const {
      alert,
      currImgIdx,
      currTab,
      quantity,
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
              className={this.mainImgClassName}
              data-zoom={this.mainImgSrc}
              ref={this.onRefMainImg}
              src={this.mainImgSrc}
            />
            <div
              className="thmbs"
              ref={this.onRefImagesSlider}
            >
              {pData.images.map((image, idx) => {
                const key = `img_${idx}`;
                let className = 'itm';

                if (idx === currImgIdx) {
                  className += ' active';
                }

                return (
                  <div key={key}>
                    <a
                      href="#"
                      key={key}
                      className={className}
                      data-idx={idx}
                      onClick={this.onClickToThumbImage}
                      role="button"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div
            className="col-md-8"
            id={this.driftPaneContainerId}
          >
            <div className="ttl">{pData.title}</div>
            <div className="prc">
              {tt('Price')}
              {`: ${NumberFormat(pData.price)}`}
            </div>
            <div className="form-group">
              <NumericInput
                disabledDecimal
                defaultValue={defQuantity}
                onSet={this.onSetQuantityInput}
              />
            </div>
            <button
              className="btn btn-primary animated pulse"
              disabled={!quantity}
              type="button"
              onClick={this.onClickAddToCartButton}
            >
              {tt('Add to cart')}
            </button>
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

export default Product;
