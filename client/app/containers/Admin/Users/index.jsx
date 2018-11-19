// @flow
import React from 'react';
import User from './User';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import categories from '../../../api/categories';
import users from '../../../api/users';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  limit: number,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class Users extends React.Component<Props, State> {
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

  onSubmitSearchForm() {
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
      queryObj.emailPattern = findEmailPattern;
    }

    users.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <User
            {...item}
            key={itemId}
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
      NotificationBox.dangerMessage(error.message);
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

  findEmail: ?string = null;
  items: React$Element<typeof User>[] = [];
  itemIds: string[] = [];
  rootNode: HTMLElement;
  scrollFunc: ?Function = null;
  unmounted = true;

  render() {
    const {
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;
    let itemsContent = null;
    let headerContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      itemsContent = (
        <table className="table">
          <tbody>
            {this.items}
          </tbody>
        </table>
      );

      headerContent = (
        <table className="table tbl-hd">
          <thead>
            <tr>
              <th>{tt('Email')}</th>
              <th>ETH {tt('address')}</th>
              <th />
            </tr>
          </thead>
        </table>
      );

      content = (
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
              placeholder="Enter user email"
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
    }

    return (
      <div className="Users">
        <div className="ttl">{tt('Users')}</div>
        <div className="dt">
          {content}
          {headerContent}
          <div
            className="lst"
            ref={this.onSetRootNode}
          >
            {itemsContent}
            {showLoadMore && <LoadMore />}
          </div>
        </div>
      </div>
    );
  }
}

export default Users;
