// @flow
import React, { Fragment } from 'react';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
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

class Payments extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickPaidButton = this.onClickPaidButton.bind(this);
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
    this.searchText = pureValue.length > 0 ? pureValue : null;
  }

  onClickPaidButton(event: SyntheticEvent<HTMLButtonElement>) {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    const userId = button.dataset.id;

    users.payment(userId).then((newData) => {
      const idx = parseInt(button.dataset.idx);
      const item = this.items[idx];

      if (typeof item === 'object' && item !== null) {
        item.lQSold = newData.lQSold;
      }

      NotificationBox.success('Operation completed successfully', true);
    }).catch((error) => {
      NotificationBox.danger(error.message);
      button.disabled = false;
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
    queryObj.sortBy = 'lQSold';
    queryObj.sortDesc = -1;

    const searchPattern = this.getSearchPattern();

    if (searchPattern) {
      queryObj.searchPattern = searchPattern;
    }

    users.get(queryObj).then(({ items, loadMore }) => {
      this.items = items;
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
    let itemsContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      content = (
        <Fragment>
          <form
            noValidate
            className="row actns"
            onSubmit={this.onSubmitSearchForm}
          >
            <div className="col-sm-10">
              <input
                className="form-control"
                defaultValue={this.searchText}
                onChange={this.onChangeSearchInput}
                type="text"
                placeholder="Username or email"
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
          <table className="table tbl-hd">
            <thead>
              <tr>
                <th>{tt('User')}</th>
                <th>{tt('Last payment')}</th>
                <th>{tt('Earnings')}</th>
                <th>{tt('Wallet')}</th>
                <th />
              </tr>
            </thead>
          </table>
        </Fragment>
      );

      if (this.items.length > 0) {
        itemsContent = (
          <table className="table">
            <tbody>
              {this.items.map((item, idx) => {
                const fullName = `${item.firstName} ${item.lastName}`;
                const disabledBtn = item.lQSold === 0;
                const wallet = item.pMWallet || '- - -';
                const userId = item._id.toString();

                return (
                  <tr key={userId}>
                    <td>
                      {fullName}<br />
                      Email: <a href={`mailto:${item.email}`}>{item.email}</a>
                    </td>
                    <td>{Tools.prettyTime(item.lPayoutTime)}</td>
                    <td>{NumberFormat(item.lEarnings)} $</td>
                    <td>{wallet}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-primary"
                        disabled={disabledBtn}
                        data-idx={idx}
                        data-id={userId}
                        onClick={this.onClickPaidButton}
                      >
                        paid
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      } else {
        itemsContent = <NoHaveLabel>{tt('No have waiting payments')}</NoHaveLabel>;
      }
    }

    return (
      <div className="Payments">
        <div className="dt">
          <div className="ttl">{tt('Payments')}</div>
          <div className="dt">
            {content}
            <div
              className="lst"
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

export default Payments;
