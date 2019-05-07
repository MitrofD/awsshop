// @flow
import React from 'react';
import TimeRangeControl from '../../includes/TimeRangeControl';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import DateRange from '../../../components/DateRange';
import { tt } from '../../../components/TranslateElement';
import windowScroll from '../../../api/window-scroll';
import users from '../../../api/users';

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

class LoginsHistory extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  dateRange: ?DateRange = null;

  items: Object[] = [];

  scrollFunc: ?Function = null;

  searchText: ?string = null;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onApplyTimeRangeControl = this.onApplyTimeRangeControl.bind(this);
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetDateRange = this.onSetDateRange.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
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

  onApplyTimeRangeControl(fromDate: Date, toDate: Date) {
    if (this.dateRange) {
      this.dateRange.fromDate = fromDate;
      this.dateRange.toDate = toDate;
    }
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.searchText = pureValue.length > 0 ? pureValue : null;
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

  onSetDateRange(el: ?DateRange) {
    if (el) {
      this.dateRange = el;
    }
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

    const searchTextPattern = this.getSearchTextPattern();

    if (searchTextPattern) {
      queryObj.searchPattern = searchTextPattern;
    }

    users.getLoginsHistory(queryObj).then(({ items, loadMore }) => {
      this.items = this.items.concat(items);

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
              <th>{tt('User')}</th>
              <th>{tt('Location')}</th>
              <th>{tt('Time')}</th>
            </tr>
          </thead>
        </table>
      );

      itemsContent = (
        <table className="table">
          <tbody>
            {this.items.map(item => (
              <tr key={item._id}>
                <td>
                  {item.description}
                  {' '}
(
                  <a href={`mailto:${item.userEmail}`}>{item.userEmail}</a>
)
                </td>
                <td>
                  <strong className="text-danger">{item.ip}</strong>
                  {' '}
/
                  {' '}
                  {item.location}
                </td>
                <td>{Tools.prettyTime(item.createdAt)}</td>
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
      <div className="LoginsHistory">
        <div className="ttl">{tt('Logins history')}</div>
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
                defaultValue={this.searchText}
                onChange={this.onChangeSearchInput}
                type="text"
                placeholder="Ex: Steve Jobs"
              />
            </div>
          </div>
          <DateRange ref={this.onSetDateRange} />
          <div className="row">
            <div className="col-sm-8">
              <TimeRangeControl onApply={this.onApplyTimeRangeControl} />
            </div>
            <div className="col-sm-4">
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

export default LoginsHistory;
