// @flow
import React from 'react';
import AddPage from './AddPage';
import UpdatePage from './UpdatePage';
import Page from './Page';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import windowScroll from '../../../api/window-scroll';
import pages from '../../../api/pages';

const SCROLL_FAULT = 40;

type Props = {
  limit?: number,
};

type State = {
  frontContent: React$Node,
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class Pages extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  findTitle: ?string = null;

  items: React$Element<typeof Page>[] = [];

  itemIds: string[] = [];

  scrollFunc: ?Function = null;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      frontContent: null,
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onAddedPage = this.onAddedPage.bind(this);
    self.onCancelFrontMode = this.onCancelFrontMode.bind(this);
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickAddButton = this.onClickAddButton.bind(this);
    self.onEditItem = this.onEditItem.bind(this);
    self.onRemoveItem = this.onRemoveItem.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
    self.onSubmitSearchForm = this.onSubmitSearchForm.bind(this);
    self.onUpdatedPage = this.onUpdatedPage.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onAddedPage(item: Object) {
    const getSearchRegExp = this.getSearchRegExp();

    if (!getSearchRegExp || (getSearchRegExp.test(item.path) || getSearchRegExp.test(item.title))) {
      const itemId = item._id;

      this.items.splice(0, 0, (
        <Page
          data={item}
          key={itemId}
          onEdit={this.onEditItem}
          onRemove={this.onRemoveItem}
        />
      ));

      this.itemIds.splice(0, 0, itemId);
    }

    this.onCancelFrontMode();
  }

  onUpdatedPage(item: Object) {
    const itemId = item._id;
    const idx = this.itemIds.indexOf(itemId);

    if (idx !== -1) {
      this.items[idx] = (
        <Page
          data={item}
          key={itemId}
          onEdit={this.onEditItem}
          onRemove={this.onRemoveItem}
        />
      );
    }

    this.onCancelFrontMode();
  }

  onCancelFrontMode() {
    this.setState({
      frontContent: null,
    });
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findTitle = pureValue.length > 0 ? pureValue : null;
  }

  onClickAddButton() {
    this.setState({
      frontContent: (
        <AddPage
          onCancel={this.onCancelFrontMode}
          onAdded={this.onAddedPage}
        />
      ),
    });
  }

  onEditItem(data: Object) {
    this.setState({
      frontContent: (
        <UpdatePage
          {...data}
          onCancel={this.onCancelFrontMode}
          onUpdated={this.onUpdatedPage}
        />
      ),
    });
  }

  onRemoveItem(data: Object) {
    const itemId = data._id;

    showConfirmModal('Are you sure?', () => {
      pages.remove(itemId).then(() => {
        const idx = this.itemIds.indexOf(itemId);

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

  getSearchPattern(): ?string {
    if (this.findTitle) {
      const escapedStr = Tools.escapedString(this.findTitle);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getSearchRegExp(): ?RegExp {
    const findTitlePattern = this.getSearchPattern();
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
    };

    const findTitlePattern = this.getSearchPattern();

    if (findTitlePattern) {
      queryObj.searchPattern = findTitlePattern;
    }

    pages.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <Page
            data={item}
            key={itemId}
            onEdit={this.onEditItem}
            onRemove={this.onRemoveItem}
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
      frontContent,
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
          <div className="col-sm-8">
            <input
              className="form-control"
              defaultValue={this.findTitle}
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Title or path"
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
          <div className="col-sm-2">
            <button
              className="btn btn-primary btn-sm btn-block"
              type="button"
              onClick={this.onClickAddButton}
            >
              {tt('Add new')}
            </button>
          </div>
        </form>
      );

      if (this.items.length > 0) {
        itemsContent = (
          <table className="table">
            <thead>
              <tr>
                <th>{tt('Title')}</th>
                <th>{tt('Path')}</th>
                <th className="text-right ">{tt('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {this.items}
            </tbody>
          </table>
        );
      } else {
        itemsContent = <NoHaveLabel>{tt('No have pages')}</NoHaveLabel>;
      }
    }

    let className = 'Pages';

    if (frontContent) {
      className += ' fnt-md';
    }

    return (
      <div className={className}>
        {frontContent}
        <div className="dt">
          <div className="ttl">{tt('Pages')}</div>
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

export default Pages;
