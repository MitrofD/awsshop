// @flow
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import Cart from './Cart';
import UserMenu from './UserMenu';
import NavLogo from '../NavLogo';
import NavLoginOrRegister from '../NavLoginOrRegister';
import { tt } from '../../../components/TranslateElement';

type Props = {
  user: ?Object,
};

type State = {
  showMobileMenu: boolean,
};

const isActiveCatalogLink = (function makeIsActiveCatalogLink() {
  const catergoryPathRegExp = new RegExp(`^${Config.categoryPath}.*`);

  return (match: ?Object, location: Object) => {
    if (match) {
      return true;
    }

    return catergoryPathRegExp.test(location.pathname);
  };
}());

class Header extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      showMobileMenu: false,
    };

    const self: any = this;
    self.onToggleMobileMenu = this.onToggleMobileMenu.bind(this);
  }

  onToggleMobileMenu() {
    this.setState(oldState => ({
      showMobileMenu: !oldState.showMobileMenu,
    }));
  }

  render() {
    const {
      user,
    } = this.props;

    const {
      showMobileMenu,
    } = this.state;

    let collapseMenuClassName = 'collapse navbar-collapse';

    if (showMobileMenu) {
      collapseMenuClassName += ' show';
    }

    let becomePartnerLink = `${Config.dashboardPath}/invited-users`;

    if (!user) {
      becomePartnerLink = `/login?redirect=${becomePartnerLink}`;
    }

    return (
      <header>
        <nav className="navbar navbar-expand-lg navbar-light bg-white">
          <div className="container">
            <NavLogo />
            <button
              className="navbar-toggler"
              onClick={this.onToggleMobileMenu}
              type="button"
            >
              <span className="navbar-toggler-icon" />
            </button>
            <div className={collapseMenuClassName}>
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <NavLink
                    exact
                    className="nav-link"
                    to="/"
                  >
                    {tt('Home')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    isActive={isActiveCatalogLink}
                    to="/catalog"
                  >
                    {tt('Catalog')}
                  </NavLink>
                </li>
                {!user && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to="/create-shop"
                    >
                      {tt('Create Shop')}
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to={becomePartnerLink}
                  >
                    {tt('Become partner')}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className="nav-link"
                    to="/support"
                  >
                    {tt('Contact us')}
                  </NavLink>
                </li>
              </ul>
              <ul className="navbar-nav ml-auto">
                {user ? <UserMenu user={user} /> : (
                  <li className="nav-item">
                    <Link
                      className="nav-link brdrd"
                      to="/login"
                    >
                      {tt('Login')}
                    </Link>
                  </li>
                )}
                <Cart />
              </ul>
            </div>
          </div>
        </nav>
      </header>
    );
  }
}

export default asHOT(module)(Header);
