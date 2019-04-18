// @flow
import React from 'react';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import windowScroll from '../../../api/window-scroll';
import data from '../../../api/data';
import users from '../../../api/users';

const SCROLL_FAULT = 40;

const MODE = {
  START_OF_MONTH: 'START_OF_MONTH',
  ON_THE_SAME_DATE: 'ON_THE_SAME_DATE',
  CURR_TIME: 'CURR_TIME',
};

type Props = {
  limit?: number,
  mode: $Keys<typeof MODE>,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class Payments extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  startOfMonthTime = 0;

  items: Object[] = [];

  scrollFunc: ?Function = null;

  searchText: ?string = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    this.title = 'Last payout -';

    if (props.mode === MODE.ON_THE_SAME_DATE) {
      this.paymentFunc = users.paymentOnTheSameMonth;
      this.title += ' on the same date';
      this.breakFunc = (item: Object, uItem: Object) => {
        const currDate = new Date(this.startOfMonthTime);
        const usDate = new Date(uItem.payoutTime);
        currDate.setDate(usDate.getDate() - 1);
        return item.t > currDate.getTime();
      };
    } else if (props.mode === MODE.CURR_TIME) {
      this.paymentFunc = users.paymentCurr;
      this.title += ' current time';
      this.breakFunc = () => false;
    } else {
      this.paymentFunc = users.paymentStartOfMonth;
      this.title += ` end of ${Tools.getPrevMonthName()}`;
      this.breakFunc = (item: Object) => item.t > this.startOfMonthTime;
    }

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickPaidButton = self.onClickPaidButton.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    data.getStartOfMonthTime().then((startOfMonthTime) => {
      if (this.unmounted) {
        return;
      }

      this.startOfMonthTime = startOfMonthTime;
      this.filter();
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.searchText = pureValue.length > 0 ? pureValue : null;
  }

  onClickPaidButton(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    const userId = button.dataset.id;

    this.paymentFunc(userId).then(() => {
      const idx = parseInt(button.dataset.idx);
      const item = this.items[idx];

      if (typeof item === 'object' && item !== null) {
        item.disabledPay = true;
      }

      NotificationBox.success('Operation completed successfully', true);
    }).catch((error) => {
      NotificationBox.danger(error.message);
      button.disabled = false;
    });
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

  getSearchTextPattern(): ?string {
    if (this.searchText) {
      const escapedStr = Tools.escapedString(this.searchText);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getSearchTextRegExp(): ?RegExp {
    const searchTextPattern = this.getSearchTextPattern();
    return searchTextPattern ? new RegExp(searchTextPattern, 'i') : null;
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
    queryObj.sortBy = 'lastActionTime';
    queryObj.sortDesc = -1;

    const searchTextPattern = this.getSearchTextPattern();

    if (searchTextPattern) {
      queryObj.searchPattern = searchTextPattern;
    }

    users.get(queryObj).then(({ items, loadMore }) => {
      const itemsArrLength = items.length;
      let i = 0;

      for (; i < itemsArrLength; i += 1) {
        const item = items[i];
        const pArr = Tools.isArray(item.waitingPayments) ? item.waitingPayments : [];
        const pArrLength = pArr.length;
        let earnings = 0;
        let pI = 0;

        for (; pI < pArrLength; pI += 1) {
          const pItem = pArr[pI];

          if (this.breakFunc(pItem, item)) {
            break;
          }

          earnings += pItem.e;
        }

        delete item.waitingPayments;

        let disabledPay = true;
        let earningsText = '- - -';

        if (earnings > 0) {
          disabledPay = false;
          earningsText = NumberFormat(earnings);
        }

        item._id = item._id.toString();
        item.disabledPay = disabledPay;
        item.earningsText = earningsText;
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

  topListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  rootNode: HTMLElement;

  breakFunc: (Object, Object) => boolean;

  paymentFunc: Function;

  title: string;

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
    } else {
      content = (
        <table className="table tbl-hd">
          <thead>
            <tr>
              <th>User</th>
              <th>Last payout</th>
              <th>Waiting for payments</th>
              <th />
            </tr>
          </thead>
        </table>
      );

      itemsContent = (
        <table className="table">
          <tbody>
            {this.items.map((item, idx) => (
              <tr key={item._id}>
                <td>
                  <a href={`mailto:${item.email}`}>
                    {item.firstName}
                    {' '}
                    {item.lastName}
                  </a>
                </td>
                <td>{Tools.prettyTime(item.payoutTime)}</td>
                <td>{item.earningsText}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={item.disabledPay}
                    data-idx={idx}
                    data-id={item._id}
                    type="button"
                    onClick={this.onClickPaidButton}
                  >
                    Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (showLoadMore) {
      loadMoreContent = <LoadMore />;
      disabledSearchButton = true;
    }

    return (
      <div className="Payments">
        <div className="ttl">{this.title}</div>
        <form
          noValidate
          className="actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="row">
            <div className="col-sm-8">
              <input
                className="form-control"
                defaultValue={this.searchText}
                onChange={this.onChangeSearchInput}
                type="text"
                placeholder="Username or email"
              />
            </div>
            <div className="col-sm-4">
              <button
                className="btn btn-primary btn-sm btn-block"
                disabled={disabledSearchButton}
                type="submit"
              >
                Search
              </button>
            </div>
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

export default Payments;
