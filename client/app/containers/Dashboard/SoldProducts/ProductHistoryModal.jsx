// @flow
import React from 'react';
import Modal, { SIZE } from '../../../components/Modal';
import NoHaveLabel from '../../includes/NoHaveLabel';
import LoadMore from '../../includes/LoadMore';
import XHRSpin from '../../includes/XHRSpin';
import users from '../../../api/users';
import { tt } from '../../../components/TranslateElement';

type Props = {
  id: string,
  limit?: number,
  onClose: Function,
};

type State = {
  showLoadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class ProductHistoryModal extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  items: Object[] = [];

  scrollFunc: ?Function = null;

  listNode: HTMLElement;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onScrollNode = this.onScrollNode.bind(this);
    self.onRefRootNode = this.onRefRootNode.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
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

  onRefRootNode(el: ?HTMLElement) {
    if (el) {
      this.rootNode = el;
    }
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

  stopListenWindowScroll() {
    if (this.scrollFunc) {
      this.rootNode.removeEventListener('scroll', this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  filter() {
    this.stopListenWindowScroll();

    const queryObj = {};
    queryObj.limit = this.props.limit;
    queryObj.skip = this.items.length;

    users.getSoldProductHistory(this.props.id, queryObj).then(({ items, loadMore }) => {
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

  render() {
    const {
      showLoadMore,
      xhrRequest,
    } = this.state;

    let content = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else if (this.items.length > 0) {
      content = (
        <table className="table">
          <tbody>
            {this.items.map((item, idx) => (
              <tr key={item._id}>
                <td>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="img-thumbnail"
                  />
                </td>
                <td>
                  <div>{item.title}</div>
                </td>
                <td>
                  <div className="text-secondary">
                    {Tools.prettyTime(item.createdAt)}
                  </div>
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
            ))}
          </tbody>
        </table>
      );
    } else {
      content = <NoHaveLabel>{tt('Not found history')}</NoHaveLabel>;
    }

    return (
      <Modal
        isOpened
        onClose={this.props.onClose}
        size={SIZE.LARGE}
      >
        <div
          className="lst"
          ref={this.onRefRootNode}
        >
          {content}
          {showLoadMore && <LoadMore />}
        </div>
      </Modal>
    );
  }
}

export default ProductHistoryModal;
