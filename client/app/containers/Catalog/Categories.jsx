// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import LoadMore from '../includes/LoadMore';
import XHRSpin from '../includes/XHRSpin';
import { tt } from '../../components/TranslateElement';
import categories from '../../api/categories';
import windowScroll from '../../api/window-scroll';

const ITEM_CLASS_NAME = 'itm';
const ACTIVE_ITEM_CLASS_NAME = ' active';
const SCROLL_FAULT = 40;

type Props = {
  category?: ?string,
  limit?: number,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  category: null,
  limit: 50,
};

class Categories extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.next();
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

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  next() {
    this.stopListenWindowScroll();

    const query = {
      limit: this.props.limit,
      sortBy: 'productsCount',
      sortDesc: -1,
      skip: this.items.length,
    };

    categories.get(query).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const pureItem = Object.assign({
          encodedName: encodeURIComponent(item.name),
        }, item);

        this.items.push(pureItem);
      });

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
    } else {
      let allItemCN = ITEM_CLASS_NAME;
      let getItemCN: Function = () => ITEM_CLASS_NAME;

      if (this.props.category) {
        const decodedName = decodeURIComponent(this.props.category);

        getItemCN = (name: string) => {
          let itemCN = ITEM_CLASS_NAME;

          if (name === decodedName) {
            itemCN += ACTIVE_ITEM_CLASS_NAME;
          }

          return itemCN;
        };
      } else {
        allItemCN += ACTIVE_ITEM_CLASS_NAME;
      }

      content = (
        <div className="Categories sdbr">
          <div className="ttl">
            {tt('Categories')}
          </div>
          <ul className="lst">
            <li>
              <Link
                className={allItemCN}
                to="/"
              >
                {tt('All')}
              </Link>
            </li>
            {this.items.map(item => (
              <li key={item._id}>
                <Link
                  className={getItemCN(item.name)}
                  to={Config.categoryPath + item.encodedName}
                >
                  {tt(item.name)}&nbsp;({item.productsCount})
                </Link>
              </li>
            ))}
          </ul>
          {showLoadMore && <LoadMore />}
        </div>
      );
    }

    return (
      <div
        className="Categories"
        ref={this.onSetRootNode}
      >
        {content}
      </div>
    );
  }
}

export default Categories;
