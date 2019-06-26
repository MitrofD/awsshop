// @flow
import React from 'react';
import ProductHistoryModal from './ProductHistoryModal';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import DateRange from '../../../components/DateRange';
import { tt } from '../../../components/TranslateElement';
import TimeRangeControl from '../../includes/TimeRangeControl';
import users from '../../../api/users';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  limit?: number,
};

type State = {
  modal: ?React$Element<typeof ProductHistoryModal>,
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class SoldProducts extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  dateRange: ?DateRange = null;

  searchText: ?string = null;

  items: Object[] = [];

  scrollFunc: ?Function = null;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      modal: null,
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onApplyTimeRangeControl = this.onApplyTimeRangeControl.bind(this);
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickItem = this.onClickItem.bind(this);
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onSetDateRange = this.onSetDateRange.bind(this);
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

  onClickItem(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    const item = event.currentTarget;
    const { id } = item.dataset;
    this.setState({
      modal: (
        <ProductHistoryModal
          id={id}
          onClose={this.onCloseModal}
        />
      ),
    });
  }

  onCloseModal() {
    this.setState({
      modal: null,
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

  getFindTitlePattern(): ?string {
    if (this.searchText) {
      const escapedStr = Tools.escapedString(this.searchText);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getFindTitleRegExp(): ?RegExp {
    const searchTextPattern = this.getFindTitlePattern();
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

    const queryObj: { [string]: any } = {
      limit: this.props.limit,
      skip: this.items.length,
    };

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

    const searchTextPattern = this.getFindTitlePattern();

    if (searchTextPattern) {
      queryObj.searchPattern = searchTextPattern;
    }

    users.getSoldProducts(queryObj).then(({ items, loadMore }) => {
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

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  render() {
    const {
      modal,
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;
    let disabledSearchButton = false;
    let loadMoreContent = null;
    let itemsContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
      disabledSearchButton = true;
    } else if (this.items.length > 0) {
      content = (
        <table className="table tbl-hd">
          <thead>
            <tr>
              <th>Image</th>
              <th>ID and title</th>
              <th>Price</th>
              <th>Info</th>
            </tr>
          </thead>
        </table>
      );

      itemsContent = (
        <table className="table table-hover">
          <tbody>
            {this.items.map((item) => {
              const pId = item._id.toString();

              return (
                <tr
                  key={pId}
                  onClick={this.onClickItem}
                  data-id={item.productId}
                >
                  <td>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="img-thumbnail"
                    />
                  </td>
                  <td>
                    <strong className="text-primary mb-3">
                      {`#${item.productId}`}
                    </strong>
                    <div>{item.title}</div>
                  </td>
                  <td>
                    <div className="text-secondary">{NumberFormat(item.price)}</div>
                  </td>
                  <td>
                    <div className="text-primary">
                      {`Quantity: ${item.quantity}`}
                    </div>
                    <div className="text-primary">
                      {`Earnings: ${NumberFormat(item.earnings)}`}
                    </div>
                    <div className="text-danger">
                      {`Payout: ${NumberFormat(item.payout)}`}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    } else {
      itemsContent = <NoHaveLabel>No records found</NoHaveLabel>;
    }

    if (showLoadMore) {
      loadMoreContent = <LoadMore />;
      disabledSearchButton = true;
    }

    return (
      <div className="SoldProducts">
        <div className="ttl">{tt('Sold products')}</div>
        <form
          noValidate
          className="actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="row">
            <div className="col-sm-12 form-group">
              <label>{tt('Product name:')}</label>
              <input
                className="form-control"
                defaultValue={this.searchText}
                onChange={this.onChangeSearchInput}
                type="text"
                placeholder="Ex: car"
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
          {modal}
          {content}
          <div
            className="lst"
            ref={this.onSetRootNode}
          >
            {itemsContent}
          </div>
          {loadMoreContent}
        </div>
      </div>
    );
  }
}

export default SoldProducts;
