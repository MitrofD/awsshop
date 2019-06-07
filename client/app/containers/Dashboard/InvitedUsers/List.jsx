// @flow
import React from 'react';
import PaymentsList from './PaymentsList';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import NoHaveLabel from '../../includes/NoHaveLabel';
import DateRange from '../../../components/DateRange';
import { tt } from '../../../components/TranslateElement';
import users from '../../../api/users';
import serverSettings from '../../../api/server-settings';
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

class List extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  dateRange: ?DateRange = null;

  items: Object[] = [];

  refPurchasePrice = 0;

  rootNode: HTMLElement;

  scrollFunc: ?Function = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
    self.onRefDateRange = this.onRefDateRange.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    serverSettings.get().then((settings) => {
      if (this.unmounted) {
        return;
      }

      this.refPurchasePrice = parseFloat(settings.REF_PURCHASE_PRICE) || 0;
      this.filter();
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
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
      this.filter();
    }
  }

  onSubmitSearchForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    this.reset();
    this.filter();
  }

  onSetRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
  }

  onRefDateRange(el: ?DateRange) {
    if (el) {
      this.dateRange = el;
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

  filter() {
    this.stopListenWindowScroll();
    const queryObj = {};
    queryObj.limit = this.props.limit;
    queryObj.skip = this.items.length;

    if (this.dateRange) {
      const {
        fromDate,
        toDate,
      } = this.dateRange;

      if (fromDate) {
        queryObj.from = fromDate.getTime();
      }

      if (toDate) {
        queryObj.to = toDate.getTime();
      }
    }

    users.getRefPaymentsHistory(queryObj).then(({ items, loadMore }) => {
      const itemsLength = items.length;
      let i = 0;

      for (; i < itemsLength; i += 1) {
        const item = items[i];
        const itemUpdateDate = new Date(item.updatedAt);
        item.monthYear = Tools.getMonthYearForDate(itemUpdateDate);
        item.earningsText = NumberFormat(item.earnings);
        item.list = <PaymentsList items={item.items} />;
        this.items.push(item);
      }

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
    let disabledSearchButton = false;
    let itemsContent = null;
    let loadMoreContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
      disabledSearchButton = true;
    } else if (this.items.length > 0) {
      content = (
        <table className="table tbl-hd">
          <thead>
            <tr>
              <th>Month</th>
              <th>By users</th>
              <th>Quantity / earnings</th>
            </tr>
          </thead>
        </table>
      );

      itemsContent = (
        <table className="table">
          <tbody>
            {this.items.map(item => (
              <tr key={item._id}>
                <td>{item.monthYear}</td>
                <td>{item.list}</td>
                <td>
                  {item.quantity}
                  {' / '}
                  <strong className="text-danger">{item.earningsText}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      content = <NoHaveLabel>No users found</NoHaveLabel>;
    }

    if (showLoadMore) {
      loadMoreContent = <LoadMore />;
      disabledSearchButton = true;
    }

    return (
      <div className="List">
        <form
          noValidate
          className="row actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="col-sm-10">
            <DateRange
              maxDetail="year"
              ref={this.onRefDateRange}
            />
          </div>
          <div className="col-sm-2">
            <button
              className="btn btn-primary btn-sm btn-block"
              disabled={disabledSearchButton}
              type="submit"
            >
              {tt('Search')}
            </button>
          </div>
        </form>
        <div className="dt">
          {content}
          <div
            className="lst"
            ref={this.onSetRootNode}
          >
            {itemsContent}
            {loadMoreContent}
          </div>
        </div>
      </div>
    );
  }
}

export default List;
