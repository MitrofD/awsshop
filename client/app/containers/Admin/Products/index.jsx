// @flow
import React from 'react';
import Product from './Product';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import products from '../../../api/products';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  limit?: number,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class Products extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  findTitle: ?string = null;

  items: React$Element<typeof Product>[] = [];

  itemIds: string[] = [];

  scrollFunc: ?Function = null;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onDeleteProduct = this.onDeleteProduct.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findTitle = pureValue.length > 0 ? pureValue : null;
  }

  onDeleteProduct(data: Object) {
    const productID = data._id;

    showConfirmModal('Are you sure?', () => {
      products.delete(productID).then(() => {
        const idx = this.itemIds.indexOf(productID);

        if (idx !== -1) {
          this.items.splice(idx, 1);
          this.itemIds.splice(idx, 1);
          this.forceUpdate();
        }
      }).catch((error) => {
        NotificationBox.danger(error.message);
      });
    });
  }

  onSetRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
  }

  onScrollWindow(scrollData: Object) {
    const rootNodeHeight = this.rootNode.offsetHeight;
    const rootNodeTop = this.rootNode.offsetTop;
    const rootNodeBottom = rootNodeHeight + rootNodeTop;
    const windowBottom = SCROLL_FAULT + scrollData.height + scrollData.topPos;

    if (windowBottom >= rootNodeBottom) {
      this.filter();
    }
  }

  onSubmitSearchForm() {
    this.reset();
    this.filter();
  }

  getFindTitlePattern(): ?string {
    if (this.findTitle) {
      const escapedStr = Tools.escapedString(this.findTitle);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getFindTitleRegExp(): ?RegExp {
    const findTitlePattern = this.getFindTitlePattern();
    return findTitlePattern ? new RegExp(findTitlePattern, 'i') : null;
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

  filter() {
    this.stopListenWindowScroll();

    const queryObj: { [string]: any } = {
      limit: this.props.limit,
      skip: this.items.length,
      sortBy: 'createdAt',
      sortDesc: -1,
    };

    const findTitlePattern = this.getFindTitlePattern();

    if (findTitlePattern) {
      queryObj.titlePattern = findTitlePattern;
    }

    products.getAdmin(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <Product
            data={item}
            key={itemId}
            onDelete={this.onDeleteProduct}
          />
        ));
        this.itemIds.push(itemId);
      });

      this.setStateAfterRequest({
        showLoadMore: loadMore,
      });

      if (loadMore) {
        this.scrollFunc = windowScroll.bind(this.onScrollWindow);
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.setStateAfterRequest({});
    });
  }

  reset() {
    this.items = [];
    this.itemIds = [];

    this.setState({
      xhrRequest: true,
    });
  }

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  render() {
    const {
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;
    let itemsContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      content = (
        <form
          noValidate
          className="row actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="col-sm-10">
            <input
              className="form-control"
              defaultValue={this.findTitle}
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Product title"
            />
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-primary btn-sm btn-block"
              type="submit"
            >
              {tt('Search')}
            </button>
          </div>
        </form>
      );

      if (this.items.length > 0) {
        itemsContent = this.items;
      } else {
        itemsContent = <NoHaveLabel>{tt('No products found')}</NoHaveLabel>;
      }
    }

    return (
      <div className="Products">
        <div className="dt">
          <div className="ttl">{tt('Products')}</div>
          <div className="dt">
            {content}
            <div
              className="lst row"
              ref={this.onSetRootNode}
            >
              {itemsContent}
            </div>
            {showLoadMore && <LoadMore />}
          </div>
        </div>
      </div>
    );
  }
}

export default Products;
