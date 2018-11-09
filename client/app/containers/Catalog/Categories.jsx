// @flow
import React from 'react';
import AlertDanger from '../../components/alerts/AlertDanger';
import { tt } from '../../components/TranslateElement';
import Sidebar from '../includes/Sidebar';
import categories from '../../api/categories';

type Props = {
  onDidInit: Function,
};

type State = {
  alert: React$Node,
  items: Object[],
  xhrRequest: boolean,
};

class Categories extends React.PureComponent<Props, State> {
  state = {
    alert: null,
    items: [],
    xhrRequest: true,
  };

  componentDidMount() {
    this.unmounted = false;

    const finishWithData = (data: Object) => {
      this.setStateAfterRequest(data);
      this.props.onDidInit();
    };

    categories.get().then(({ items }) => {
      finishWithData({
        items,
      });
    }).catch((error) => {
      const alertDanger = <AlertDanger>{error.message}</AlertDanger>;
      finishWithData({
        alert: alertDanger,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  setStateAfterRequest(newState: Object) {
    if (this.unmounted) {
      return;
    }

    const pureState = Object.assign({
      xhrRequest: false,
    }, newState);

    this.setState(pureState);
  }

  unmounted = true;

  render() {
    const {
      items,
      xhrRequest,
    } = this.state;

    let content = null;

    if (items.length > 0) {
      content = (
        <Sidebar title={tt('Categories')}>
          {items.map((item) => {
            const itemCN = 'itm';

            return (
              <a
                className={itemCN}
                href="#!"
                key={item._id}
              >
                {item.name} {item.productsCount}
              </a>
            );
          })}
        </Sidebar>
      );
    }

    return content;
  }
}

export default Categories;
