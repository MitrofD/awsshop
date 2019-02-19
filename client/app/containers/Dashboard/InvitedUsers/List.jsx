// @flow
import React from 'react';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import user from '../../../api/user';
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

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    serverSettings.get().then((settings) => {
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

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findEmail = pureValue.length > 0 ? pureValue : null;
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

  getFindEmailPattern(): ?string {
    if (this.findEmail) {
      const escapedStr = Tools.escapedString(this.findEmail);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getFindEmailRegExp(): ?RegExp {
    const findEmailPattern = this.getFindEmailPattern();
    return findEmailPattern ? new RegExp(findEmailPattern, 'i') : null;
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

    const findEmailPattern = this.getFindEmailPattern();

    if (findEmailPattern) {
      queryObj.searchPattern = findEmailPattern;
    }

    user.getInvitedUsers(queryObj).then(({ items, loadMore }) => {
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

  findEmail: ?string = null;
  items: Object[] = [];
  refPurchasePrice = 0;
  rootNode: HTMLElement;
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
    } else {
      content = (
        <table className="table tbl-hd">
          <thead>
            <tr>
              <th>{tt('Username')}</th>
              <th>{tt('Email')}</th>
              <th>{tt('Total earnings')}</th>
              <th>{tt('Waiting for payment')}</th>
            </tr>
          </thead>
        </table>
      );

      itemsContent = (
        <table className="table">
          <tbody>
            {this.items.map((item) => {
              const fullName = `${item.firstName} ${item.lastName}`;
              const waitingEarnings = item.lRefQSold * this.refPurchasePrice;

              return (
                <tr key={item._id}>
                  <td>{fullName}</td>
                  <td>
                    <a href={`mailto:${item.email}`}>{item.email}</a>
                  </td>
                  <td>{NumberFormat(item.tRefEarnings)} $</td>
                  <td>{NumberFormat(waitingEarnings)} $</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
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
            <input
              className="form-control"
              defaultValue={this.findEmail}
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Username or email"
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
