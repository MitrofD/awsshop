// @flow
import React from 'react';
import Item from './Item';
import Page from '../includes/Page';
import LoadMore from '../includes/LoadMore';
import NoHaveLabel from '../includes/NoHaveLabel';
import XHRSpin from '../includes/XHRSpin';
import { tt } from '../../components/TranslateElement';
import windowScroll from '../../api/window-scroll';
import faqs from '../../api/faqs';

const SCROLL_FAULT = 40;

type Props = {
  limit?: number,
};

type State = {
  loadMore: boolean,
  xhrRequest: boolean,
};

const defaultProps = {
  limit: 50,
};

class FAQ extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  items: React$Element<typeof Item>[] = [];

  scrollFunc: ?Function = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      loadMore: false,
      xhrRequest: true,
    };

    const self: any = this;
    self.onSetRootNode = this.onSetRootNode.bind(this);
    self.onScrollWindow = this.onScrollWindow.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    this.filter();
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopListenWindowScroll();
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

  onSetRootNode(el: ?HTMLElement) {
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
      windowScroll.unbind(this.scrollFunc);
      this.scrollFunc = null;
    }
  }

  filter() {
    this.stopListenWindowScroll();

    const queryObj = {};
    queryObj.limit = this.props.limit;
    queryObj.skip = this.items.length;

    faqs.get(queryObj).then(({ items, loadMore }) => {
      items.forEach((item) => {
        this.items.push((
          <Item
            {...item}
            key={item._id}
          />
        ));
      });

      this.setStateAfterRequest({
        loadMore,
      });

      if (loadMore) {
        this.scrollFunc = windowScroll.bind(this.onScrollWindow);
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.setStateAfterRequest({});
    });
  }

  rootNode: HTMLElement;

  render() {
    const {
      loadMore,
      xhrRequest,
    } = this.state;

    let content = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else if (this.items.length === 0) {
      content = (
        <NoHaveLabel>
          {tt('Items')}
          {' '}
          {tt('not found')}
        </NoHaveLabel>
      );
    } else {
      content = (
        <div className="items row">
          <div className="col-lg-8 offset-lg-2">
            {this.items}
          </div>
        </div>
      );
    }

    return (
      <Page className="FAQ sp">
        <div className="p-ttl">{tt('Frequently asked Questions')}</div>
        <p className="desc">
          Do you have questions? The Modern Pack has answers.
          <br />
          Read below and find out the answers to the questions that keep on bothering you
        </p>
        {content}
        {loadMore && <LoadMore />}
      </Page>
    );
  }
}

export default FAQ;
