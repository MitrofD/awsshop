// @flow
import React from 'react';
import { hot } from 'react-hot-loader/root';
import Item from './Item';
import Page from '../includes/Page';
import NoHaveLabel from '../includes/NoHaveLabel';
import LoadMore from '../includes/LoadMore';
import XHRSpin from '../includes/XHRSpin';
import { tt } from '../../components/TranslateElement';
import vacancies from '../../api/vacancies';
import windowScroll from '../../api/window-scroll';

const SCROLL_FAULT = 40;
const fullCN = 'Careers as-full';

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

class Careers extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  items: React$Element<typeof Item>[] = [];

  scrollFunc: ?Function = null;

  rootNode: HTMLElement;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showLoadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    RootNode.addClass(fullCN);
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    RootNode.removeClass(fullCN);
    this.stopListenWindowScroll();
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

    const queryObj = {
      limit: this.props.limit,
      skip: this.items.length,
      sortBy: 'createdAt',
      sortDesc: -1,
    };

    vacancies.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        const itemId = item._id;
        this.items.push((
          <Item
            {...item}
            key={itemId}
          />
        ));
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
        <div className="table-responsive">
          <table className="table table-striped border">
            <tbody>
              {this.items}
            </tbody>
          </table>
        </div>
      );
    } else {
      content = <NoHaveLabel>{tt('No have careers')}</NoHaveLabel>;
    }

    return (
      <Page>
        <div className="top-box">
          <div className="container">
            <div className="p-ttl">{tt('Careers')}</div>
          </div>
        </div>
        <div className="container">
          <div className="ttop white-box padding">
            <div className="pre-ttl">
              {tt('You’re just a few steps away from starting your dream job!')}
            </div>
            <div className="p-ttl">
              {tt('Our current careers')}
            </div>
            {content}
            {showLoadMore && <LoadMore />}
          </div>
        </div>
      </Page>
    );
  }
}

export default hot(Careers);
