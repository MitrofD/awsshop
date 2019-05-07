// @flow
import React from 'react';
import Item from './Item';
import ItemSubmitModal from './ItemSubmitModal';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import { tt } from '../../../components/TranslateElement';
import faqs from '../../../api/faqs';
import windowScroll from '../../../api/window-scroll';

const SCROLL_FAULT = 40;

type Props = {
  limit?: number,
};

type State = {
  modal: React$Node,
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class FAQs extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  findName: ?string = null;

  items: React$Element<typeof Item>[] = [];

  itemIds: string[] = [];

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
    self.onAddedItem = this.onAddedItem.bind(this);
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onClickAddButton = this.onClickAddButton.bind(this);
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onRemoveItem = this.onRemoveItem.bind(this);
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

  onAddedItem(item: Object) {
    const findNameRegExp = this.getSearchRegExp();

    if (!findNameRegExp || findNameRegExp.test(item.name)) {
      const itemId = item._id;

      this.items.splice(0, 0, (
        <Item
          data={item}
          key={itemId}
          onRemove={this.onRemoveItem}
        />
      ));

      this.itemIds.splice(0, 0, itemId);
    }

    this.onCloseModal();
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findName = pureValue.length > 0 ? pureValue : null;
  }

  onCloseModal() {
    this.setState({
      modal: null,
    });
  }

  onClickAddButton() {
    this.setState({
      modal: (
        <ItemSubmitModal
          isOpened
          title="New item"
          onSuccess={this.onAddedItem}
          onClose={this.onCloseModal}
        />
      ),
    });
  }

  onRemoveItem(id: string) {
    const idx = this.itemIds.indexOf(id);

    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.itemIds.splice(idx, 1);
      this.forceUpdate();
    }
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
    if (this.findName) {
      const escapedStr = Tools.escapedString(this.findName);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getSearchRegExp(): ?RegExp {
    const searchPattern = this.getSearchPattern();
    return searchPattern ? new RegExp(searchPattern, 'i') : null;
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

    const searchPattern = this.getSearchPattern();

    if (searchPattern) {
      queryObj.searchPattern = searchPattern;
    }

    queryObj.skip = this.items.length;

    faqs.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <Item
            data={item}
            key={itemId}
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

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  reset() {
    this.items = [];
    this.itemIds = [];

    this.setState({
      xhrRequest: true,
    });
  }

  render() {
    const {
      modal,
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;
    let itemsContent = null;
    let headerContent = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      if (this.items.length > 0) {
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
                <th>{tt('Question')}</th>
                <th>{tt('Answer')}</th>
                <th className="text-right">{tt('Actions')}</th>
              </tr>
            </thead>
          </table>
        );
      } else {
        headerContent = (
          <NoHaveLabel>
            {tt('No have items')}
          </NoHaveLabel>
        );
      }

      content = (
        <form
          noValidate
          className="row actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="col-sm-8">
            <input
              className="form-control"
              defaultValue={this.findName}
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Question"
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
              onClick={this.onClickAddButton}
              type="button"
            >
              {tt('Add item')}
            </button>
          </div>
        </form>
      );
    }

    return (
      <div className="FAQs">
        {modal}
        <div className="ttl">{tt('FAQ items')}</div>
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

export default FAQs;
