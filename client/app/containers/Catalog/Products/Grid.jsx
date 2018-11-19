// @flow
import React, { Fragment } from 'react';
import Product from './Product';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import NoHaveLabel from '../../includes/NoHaveLabel';
import { tt } from '../../../components/TranslateElement';
import products from '../../../api/products';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  categoryId: ?string,
  limit: number,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  categoryId: null,
  limit: 50,
};

const defaultState = {
  showLoadMore: false,
  xhrRequest: true,
};

class Grid extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);
    this.state = Object.assign({}, defaultState);

    const self: any = this;
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.next();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.categoryId !== prevProps.categoryId) {
      this.reset();
      this.next();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onScrollWindow(scrollData: Object) {
    const rootNodeHeight = this.rootNode.offsetHeight;
    const rootNodeTop = this.rootNode.offsetTop;
    const rootNodeBottom = rootNodeHeight + rootNodeTop;
    const windowBottom = SCROLL_FAULT + scrollData.height + scrollData.topPos;

    if (windowBottom >= rootNodeBottom) {
      this.next();
    }
  }

  onSetRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
  }

  setStateAfterRequest(newState: Object) {
    if (this.unmounted) {
      return;
    }

    const pureNewState = Object.assign({
      xhrRequest: false,
    }, newState);

    this.setState(pureNewState);
  }

  next() {
    this.stopListenWindowScroll();

    const query: { [string]: any } = {
      limit: this.props.limit,
      sortBy: 'createdAt',
      sortDesc: -1,
      skip: this.items.length,
    };

    if (this.props.categoryId) {
      query.categoryId = this.props.categoryId;
    }

    products.get(query).then(({ items, loadMore }) => {
      this.items = this.items.concat(items);

      this.setStateAfterRequest({
        showLoadMore: loadMore,
      });

      if (loadMore) {
        this.scrollFunc = windowScroll.bind(this.onScrollWindow);
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  reset() {
    this.items = [];
    this.setState(defaultState);
  }

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  items: Object[] = [];
  rootNode: HTMLElement;
  scrollFunc: ?Function = null;
  unmounted = true;

  render() {
    const {
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else if (this.items.length > 0) {
      content = (
        <Fragment>
          <div className="row">
            {this.items.map(item => (
              <Product
                key={item._id}
                _id={item._id}
                image={item.image}
                price={item.price}
                title={item.title}
              />
            ))}
          </div>
          {showLoadMore && <LoadMore />}
        </Fragment>
      );
    } else {
      let label = 'No have products';

      if (this.props.categoryId) {
        label += ' for this category';
      }

      content = (
        <NoHaveLabel>
          {tt(label)}
        </NoHaveLabel>
      );
    }

    return (
      <div
        className="Grid"
        ref={this.onSetRootNode}
      >
        {content}
      </div>
    );
  }
}

export default Grid;
