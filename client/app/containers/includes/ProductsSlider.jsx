// @flow
import React from 'react';
import Product from './Product';
import { tns } from '../../../node_modules/tiny-slider/src/tiny-slider';
import NoHaveLabel from '../includes/NoHaveLabel';
import RectangleBounceSpin from '../../components/spins/RectangleBounceSpin';
import { tt } from '../../components/TranslateElement';
import products from '../../api/products';

const ITEMS_MIN_COUNT = 30;

type Props = {
  title: string,
  sortBy?: ?string,
  sortDesc?: ?number,
};

type State = {
  xhrRequest: boolean,
};

const defaultProps = {
  sortBy: null,
  sortDesc: null,
};

class ProductsSlider extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      xhrRequest: true,
    };

    const self: any = this;
    self.onRefSliderNode = this.onRefSliderNode.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const stopXHR = () => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });
    };

    const query = {};
    query.limit = ITEMS_MIN_COUNT;

    if (this.props.sortBy) {
      query.sortBy = this.props.sortBy;
    }

    if (this.props.sortDesc) {
      query.sortDesc = this.props.sortDesc;
    }

    products.get(query).then(({ items }) => {
      if (!Array.isArray(items)) {
        throw new Error('Answer has to be "array" type');
      }

      this.items = items.slice();

      if (items.length > 0) {
        const fillFunc = () => {
          const diff = ITEMS_MIN_COUNT - this.items.length;

          if (diff > 0) {
            const addItems = items.slice(0, diff);
            this.items = this.items.concat(addItems);
            fillFunc();
          }
        };

        fillFunc();
      }

      stopXHR();
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.hasError = true;
      stopXHR();
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.xhrRequest !== this.state.xhrRequest && this.items.length > 0) {
      this.slider = tns({
        container: this.sliderNode,
        items: 1,
        /* eslint-disable quote-props */
        responsive: {
          '1199': {
            items: 5,
          },
          '769': {
            items: 3,
          },
          '481': {
            items: 2,
          },
        },
        /* eslint-enable quote-props */
        controlsText: ['', ''],
        controls: true,
        nav: false,
        slideBy: 'page',
        gutter: 14,
        autoplay: false,
      });
    }
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.slider) {
      this.slider.destroy();
      this.slider = null;
    }
  }

  onRefSliderNode(mbEl: ?HTMLElement) {
    if (mbEl) {
      this.sliderNode = mbEl;
    }
  }

  hasError = false;
  items: Object[] = [];
  slider: ?Object;
  sliderNode: HTMLElement;
  unmounted = true;

  render() {
    let content = null;

    if (!this.hasError) {
      const {
        xhrRequest,
      } = this.state;

      let innerContent = null;
      let className = 'ProductsSlider white-box';

      if (xhrRequest) {
        className += ' lm';
        innerContent = <RectangleBounceSpin />;
      } else if (this.items.length > 0) {
        innerContent = this.items.map((item, idx) => {
          const key = `itm-${idx}`;

          return (
            <Product
              {...item}
              key={key}
            />
          );
        });
      } else {
        innerContent = <NoHaveLabel>{tt('Products not found')}</NoHaveLabel>;
      }

      content = (
        <div className={className}>
          <div className="ttl">{tt(this.props.title)}</div>
          <div
            className="list"
            ref={this.onRefSliderNode}
          >
            {innerContent}
          </div>
        </div>
      );
    }

    return content;
  }
}

export default ProductsSlider;
