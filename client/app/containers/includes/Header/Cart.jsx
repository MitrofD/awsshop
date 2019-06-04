// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import CartItem from '../CartItem';
import { tt } from '../../../components/TranslateElement';
import { PrimaryBadge } from '../../../components/Badge';
import Dropdown, { DropdownItem } from '../../../components/Dropdown';
import carts from '../../../api/carts';

type Props = {
  history: Object,
};

type State = Object;

class Cart extends React.PureComponent<Props, State> {
  dropdown: React$Node = null;

  infoSubs: ?SubscribeHandler = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);
    this.state = carts.getInfo();

    const self: any = this;
    self.onClickToLink = this.onClickToLink.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    this.infoSubs = carts.subsToInfo((info) => {
      if (this.unmounted) {
        return;
      }

      this.setState(info);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.infoSubs) {
      this.infoSubs.stop();
      this.infoSubs = null;
    }
  }

  onClickToLink(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();

    /*
    const itemsLength = this.state.items.length;

    if (!isMobile && itemsLength > 0) {
      this.fillItems();
      this.forceUpdate();
      return;
    }
    */

    this.props.history.push('/cart');
  }

  onLeaveDropdown() {
    this.dropdown = null;
    this.forceUpdate();
  }

  fillItems() {
    const {
      items,
    } = this.state;

    const dropdown = (
      <Dropdown
        rightSticky
        className="CartDropdown animated fadeIn"
        onLeave={this.onLeaveDropdown}
      >
        {items.map(item => (
          <DropdownItem key={item._id}>
            <CartItem {...item} />
          </DropdownItem>
        ))}
      </Dropdown>
    );

    this.dropdown = dropdown;
  }

  render() {
    const {
      quantity,
      summ,
    } = this.state;

    let badgeContent = null;

    if (quantity) {
      badgeContent = <PrimaryBadge>{`${quantity} • ${NumberFormat(summ)}`}</PrimaryBadge>;
    }

    return (
      <li className="nav-item">
        <a
          className="nav-link brdrd Cart"
          href="#"
          onClick={this.onClickToLink}
        >
          <div className="icn-wrppr">
            <i className="icn icn-shppng-crt" />
            {tt('Shopping cart')}
            {badgeContent}
          </div>
        </a>
        {this.dropdown}
      </li>
    );
  }
}

export default withRouter(Cart);
