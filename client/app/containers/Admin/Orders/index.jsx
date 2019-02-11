// @flow
import React from 'react';
import Order from './Order';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import orders from '../../../api/orders';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  isActive?: boolean,
  limit?: number,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  isActive: false,
  limit: 50,
};

class Orders extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);
    this.title = 'orders history';

    if (props.isActive) {
      this.title = 'active orders';
      this.deleteIfNeededFunc = (order) => {
        if (order.status === orders.STATUS.COMPLETED) {
          this.deleteWithId(order._id);
        }
      };
    } else {
      this.deleteIfNeededFunc = (order) => {
        if (order.status !== orders.STATUS.COMPLETED) {
          this.deleteWithId(order._id);
        }
      };
    }

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onDidChangeOrder = this.onDidChangeOrder.bind(this);
    self.onSetRootNodeRef = this.onSetRootNodeRef.bind(this);
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

  onDidChangeOrder(order: Object) {
    this.deleteIfNeededFunc(order);
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findTitle = pureValue.length > 0 ? pureValue : null;
  }

  onSetRootNodeRef(el: ?HTMLElement) {
    if (el) {
      this.rootNodeRef = el;
    }
  }

  onScrollWindow(scrollData: Object) {
    const rootNodeHeight = this.rootNodeRef.offsetHeight;
    const rootNodeTop = this.rootNodeRef.offsetTop;
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

  deleteWithId(id: string) {
    const idx = this.itemIds.indexOf(id);

    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.itemIds.splice(idx, 1);
      this.forceUpdate();
    }
  }

  filter() {
    this.stopListenWindowScroll();

    const queryObj: { [string]: any } = {
      isActive: this.props.isActive,
      limit: this.props.limit,
      skip: this.items.length,
    };

    const findTitlePattern = this.getFindTitlePattern();

    if (findTitlePattern) {
      queryObj.titlePattern = findTitlePattern;
    }

    orders.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const orderId = item._id;

        this.items.push((
          <Order
            data={item}
            key={orderId}
            didChange={this.onDidChangeOrder}
          />
        ));

        this.itemIds.push(orderId);
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

  findTitle: ?string = null;
  items: React$Element<typeof Order>[] = [];
  itemIds: string[] = [];
  rootNodeRef: HTMLElement;
  title: string;
  scrollFunc: ?Function = null;
  deleteIfNeededFunc: (Object) => void;
  unmounted = true;

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
              placeholder="Enter order title"
            />
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-outline-primary btn-sm btn-block"
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
        itemsContent = (
          <NoHaveLabel>
            {tt(`No have ${this.title}`)}
          </NoHaveLabel>
        );
      }
    }

    return (
      <div className="Orders">
        <div className="dt">
          <div className="ttl">{tt(this.title)}</div>
          <div className="dt">
            {content}
            <div
              className="lst row"
              ref={this.onSetRootNodeRef}
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

export default Orders;
