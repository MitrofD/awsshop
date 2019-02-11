// @flow
import React from 'react';
import Modal from '../../../../../components/Modal';
import LoadMore from '../../../../includes/LoadMore';
import NoHaveLabel from '../../../../includes/NoHaveLabel';
import XHRSpin from '../../../../includes/XHRSpin';
import categories from '../../../../../api/categories';
import { tt } from '../../../../../components/TranslateElement';

const ITEM_CLASS_NAME = 'itm';

type GetClassNameFunc = (any) => string;

type Props = {
  id?: ?string,
  limit?: number,
  onClose: Function,
  onSet: Function,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  id: null,
  limit: 50,
};

class CategoriesModal extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    if (props.id) {
      this.getItemClassName = (id) => {
        let rCN = ITEM_CLASS_NAME;

        if (id === props.id) {
          rCN += ' table-active';
        }

        return rCN;
      };
    } else {
      this.getItemClassName = () => ITEM_CLASS_NAME;
    }

    const self: any = this;
    self.onChangeSearchInput = this.onChangeSearchInput.bind(this);
    self.onKeyDownSearchInput = this.onKeyDownSearchInput.bind(this);
    self.onClickToItem = this.onClickToItem.bind(this);
    self.onCloseModal = this.onCloseModal.bind(this);
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollNode = this.onScrollNode.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
  }

  onKeyDownSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    // eslint-disable-next-line flowtype-errors/show-errors
    if (event.keyCode === 13) {
      event.preventDefault();
      this.reset();
      this.filter();
    }
  }

  onChangeSearchInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureValue = input.value.trim();
    this.findName = pureValue.length > 0 ? pureValue : null;
  }

  onCloseModal() {
    this.props.onClose();
  }

  onClickToItem(event: SyntheticEvent<HTMLElement>) {
    const data = event.currentTarget.dataset;
    const idx = parseInt(data.idx);
    const item = this.items[idx];

    if (item) {
      this.props.onSet(item);
    }
  }

  onSetRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
  }

  onScrollNode() {
    const rootNodeTop = this.rootNode.scrollTop;
    const rootNodeHeight = this.rootNode.clientHeight;
    const rootNodeScrollHeight = this.rootNode.scrollHeight;
    const rootNodeBottom = rootNodeHeight + rootNodeTop;

    if (rootNodeBottom >= rootNodeScrollHeight) {
      this.filter();
    }
  }

  getFindNamePattern(): ?string {
    if (this.findName) {
      const escapedStr = Tools.escapedString(this.findName);
      return `.*${escapedStr}.*`;
    }

    return null;
  }

  getFindNameRegExp(): ?RegExp {
    const findNamePattern = this.getFindNamePattern();
    return findNamePattern ? new RegExp(findNamePattern, 'i') : null;
  }

  getItemClassName: GetClassNameFunc;

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

    const findNamePattern = this.getFindNamePattern();

    if (findNamePattern) {
      queryObj.namePattern = findNamePattern;
    }

    queryObj.sortBy = 'createdAt';
    queryObj.sortDesc = -1;
    queryObj.skip = this.items.length;

    categories.get(queryObj).then(({ items, loadMore }) => {
      this.items = this.items.concat(items);

      this.setStateAfterRequest({
        showLoadMore: loadMore,
      });

      if (loadMore) {
        this.scrollFunc = this.rootNode.addEventListener('scroll', this.onScrollNode);
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.setStateAfterRequest({});
    });
  }

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      this.rootNode.removeEventListener('scroll', this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  reset() {
    this.items = [];

    this.setState({
      xhrRequest: true,
    });
  }

  findName: ?string = null;
  items: Object[] = [];
  listNode: HTMLElement;
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

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      content = (
        <div className="row actns">
          <div className="col-sm-8">
            <input
              className="form-control"
              defaultValue={this.findName}
              onChange={this.onChangeSearchInput}
              onKeyDown={this.onKeyDownSearchInput}
              type="text"
              placeholder="Enter category name"
            />
          </div>
          <div className="col-sm-4">
            <button
              className="btn btn-outline-primary btn-sm btn-block"
              type="submit"
            >
              {tt('Search')}
            </button>
          </div>
        </div>
      );

      if (this.items.length > 0) {
        itemsContent = (
          <table className="table table-hover">
            <tbody>
              {this.items.map((item, idx) => (
                <tr
                  className={this.getItemClassName(item._id)}
                  data-idx={idx}
                  onClick={this.onClickToItem}
                  key={item._id}
                >
                  <td>{item.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      } else {
        itemsContent = (
          <NoHaveLabel>
            {tt('No have categories')}
          </NoHaveLabel>
        );
      }
    }

    return (
      <Modal
        isOpened
        onClose={this.props.onClose}
      >
        {content}
        <div
          className="lst"
          ref={this.onSetRootNode}
        >
          {itemsContent}
          {showLoadMore && <LoadMore />}
        </div>
      </Modal>
    );
  }
}

export default CategoriesModal;
