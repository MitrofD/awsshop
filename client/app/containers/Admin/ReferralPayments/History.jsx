// @flow
import React from 'react';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import DateRange from '../../../components/DateRange';
import { tt } from '../../../components/TranslateElement';
import users from '../../../api/users';
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

class History extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
    self.onRefDateRange = this.onRefDateRange.bind(this);
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
    this.searchText = pureValue.length > 0 ? pureValue : null;
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

  onSubmitSearchForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    this.reset();
    this.filter();
  }

  onRefDateRange(el: ?DateRange) {
    if (el) {
      this.dateRange = el;
    }
  }

  getSearchPattern(): ?string {
    if (this.searchText) {
      const escapedStr = Tools.escapedString(this.searchText);
      return `.*${escapedStr}.*`;
    }

    return null;
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
    queryObj.sortBy = 'lastRefActionTime';
    queryObj.sortDesc = -1;

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

    const searchPattern = this.getSearchPattern();

    if (searchPattern) {
      queryObj.searchPattern = searchPattern;
    }

    users.getRefPaymentsHistory(queryObj).then(({ items, loadMore }) => {
      const itemsArrLength = items.length;
      let i = 0;

      for (; i < itemsArrLength; i += 1) {
        const item = items[i];
        const itemUpdateDate = new Date(item.updatedAt);
        item.monthYear = Tools.getMonthYearForDate(itemUpdateDate);
        item._id = item._id.toString();
        item.earningsText = NumberFormat(item.earnings);
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

  dateRange: ?DateRange = null;
  items: Object[] = [];
  rootNode: HTMLElement;
  searchText: ?string = null;
  scrollFunc: ?Function = null;
  unmounted = true;

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
              <th>Month / year</th>
              <th>User</th>
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
                <td>{item.userName}</td>
                <td>
                  {item.quantity} / <strong className="text-danger">{item.earningsText}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      content = <NoHaveLabel>No have payments</NoHaveLabel>;
    }

    if (showLoadMore) {
      loadMoreContent = <LoadMore />;
      disabledSearchButton = true;
    }

    return (
      <div className="History">
        <form
          noValidate
          className="actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="row">
            <div className="col-sm-12 form-group">
              <label>{tt('Username or email:')}</label>
              <input
                className="form-control"
                onChange={this.onChangeSearchInput}
                type="text"
                placeholder="Ex: Steve Jobs"
              />
            </div>
          </div>
          <div className="row">
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

export default History;
