// @flow
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { tt } from '../../../components/TranslateElement';
import Dropdown, { DropdownItem } from '../../../components/Dropdown';
import user from '../../../api/user';

type Props = {
  history: Object,
  user: Object,
};

type State = {
  dropdownShown: boolean,
};

class UserMenu extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    this.userName = props.user.firstName;

    this.state = {
      dropdownShown: false,
    };

    const self: any = this;
    self.onClickLogoutLink = this.onClickLogoutLink.bind(this);
    self.onClickToItem = this.onClickToItem.bind(this);
    self.onClickToMe = this.onClickToMe.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
  }

  onClickLogoutLink(data: any, event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.setDropdownShown(false);

    showConfirmModal('Are you sure?', () => {
      user.logout().then(() => {
        this.props.history.push('/login');
      }).catch(Tools.emptyRejectExeption);
    });
  }

  onClickToItem(data: any, event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.setDropdownShown(false);
  }

  onClickToMe(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    this.setDropdownShown(true);
  }

  onLeaveDropdown() {
    this.setDropdownShown(false);
  }

  setDropdownShown(dropdownShown: boolean) {
    this.setState({
      dropdownShown,
    });
  }

  userName: string;

  render() {
    const {
      dropdownShown,
    } = this.state;

    let dropdownContent = null;

    if (dropdownShown) {
      dropdownContent = (
        <Dropdown
          rightSticky
          onLeave={this.onLeaveDropdown}
        >
          <DropdownItem
            className="admn-only"
            onClick={this.onClickToItem}
          >
            <Link to="/admin">{tt('Admin panel')}</Link>
          </DropdownItem>
          <DropdownItem onClick={this.onClickToItem}>
            <Link to={Config.dashboardPath}>{tt('Dashboard')}</Link>
          </DropdownItem>
          <DropdownItem onClick={this.onClickToItem}>
            <Link to={Config.settingsPath}>{tt('Settings')}</Link>
          </DropdownItem>
          <DropdownItem onClick={this.onClickLogoutLink}>
            {tt('Logout')}
          </DropdownItem>
        </Dropdown>
      );
    }

    return (
      <li className="nav-item nav-profile-item">
        <a
          href="#!"
          className="nav-link brdrd"
          onClick={this.onClickToMe}
        >
          <div className="icn-wrppr">
            <i className="icn icn-prfl" />
            {' '}
            {this.userName}
          </div>
        </a>
        {dropdownContent}
      </li>
    );
  }
}

export default withRouter(UserMenu);
