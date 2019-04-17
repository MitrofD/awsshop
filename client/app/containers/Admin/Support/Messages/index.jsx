// @flow
import React from 'react';
import Item from './Item';
import NoHaveLabel from '../../../includes/NoHaveLabel';
import LoadMore from '../../../includes/LoadMore';
import XHRSpin from '../../../includes/XHRSpin';
import { tt } from '../../../../components/TranslateElement';
import support from '../../../../api/support';
import windowScroll from '../../../../api/window-scroll';

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

class Messages extends React.Component<Props, State> {
  static defaultProps = defaultProps;

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
    self.onCloseModal = this.onCloseModal.bind(this);
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
    const query = {};
    query.limit = this.props.limit;
    const searchPattern = this.getSearchPattern();

    if (searchPattern) {
      query.searchPattern = searchPattern;
    }

    query.sortBy = 'createdAt';
    query.sortDesc = -1;
    query.skip = this.items.length;

    support.getMessages(query).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <Item
            data={item}
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

  findName: ?string = null;
  items: React$Element<typeof Item>[] = [];
  itemIds: string[] = [];
  rootNode: HTMLElement;
  scrollFunc: ?Function = null;
  unmounted = true;

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
        itemsContent = this.items;
      } else {
        itemsContent = (
          <NoHaveLabel>
            {tt('Messages not found')}
          </NoHaveLabel>
        );
      }

      content = (
        <form
          noValidate
          className="row actns"
          onSubmit={this.onSubmitSearchForm}
        >
          <div className="col-sm-10">
            <input
              className="form-control"
              defaultValue={this.findName}
              onChange={this.onChangeSearchInput}
              type="text"
              placeholder="Sender name or email"
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
      <div className="Messages">
        {modal}
        <div className="dt">
          {content}
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

export default Messages;
