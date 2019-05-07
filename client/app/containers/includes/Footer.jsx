// @flow
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';

type Props = {
  user: ?Object,
};

const Footer = (props: Props) => {
  const {
    user,
  } = props;

  return (
    <footer>
      <div className="row">
        <div className="col-sm-3 col-lg-2">
          <h6>{tt('Help')}</h6>
          <ul>
            <li>
              <Link to="/faq">{tt('FAQ')}</Link>
            </li>
            <li>
              <Link to="/s/shipping">{tt('Shipping')}</Link>
            </li>
            <li>
              <Link to="/s/privacy-policy">{tt('Privacy policy')}</Link>
            </li>
            <li>
              <Link to="/s/returns">{tt('Returns')}</Link>
            </li>
            <li>
              <Link to="/s/terms-of-use">{tt('Terms of use')}</Link>
            </li>
          </ul>
        </div>
        <div className="col-sm-3 col-lg-2">
          <h6>{tt('About')}</h6>
          <ul>
            <li>
              <Link to="/">{tt('Home')}</Link>
            </li>
            <li>
              <Link to="/careers">{tt('Careers')}</Link>
            </li>
            <li>
              <Link to="/competition">{tt('Competition')}</Link>
            </li>
            <li>
              <Link to="/support">{tt('Support')}</Link>
            </li>
          </ul>
        </div>
        <div className="col-sm-3 col-lg-2">
          <h6>{tt('Account')}</h6>
          {user ? (
            <ul>
              <li>
                <Link to={`${Config.dashboardPath}/invited-users`}>{tt('Become partner')}</Link>
              </li>
              <li>
                <Link to="/shopping-cart">{tt('Cart')}</Link>
              </li>
              <li>
                <Link to={Config.dashboardPath}>{tt('My account')}</Link>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <Link to="/create-shop">{tt('Create shop')}</Link>
              </li>
              <li>
                <Link to={`/login?redirect=${Config.dashboardPath}/invited-users`}>{tt('Become partner')}</Link>
              </li>
              <li>
                <Link to={`/login?redirect=${Config.dashboardPath}`}>{tt('My account')}</Link>
              </li>
            </ul>
          )}
        </div>
        <div className="col-sm-3 col-lg-2 contact-us">
          <h6>{tt('Contact us')}</h6>
          <div className="email">{tt('Email')}</div>
          <p>
            <a href={`mailto:${Config.supportEmail}`}>{Config.supportEmail}</a>
          </p>
          {Config.supportPhone && (
            <Fragment>
              <div className="phone">{tt('Phone')}</div>
              <p>{Config.supportPhone}</p>
            </Fragment>
          )}
        </div>
        <div className="col-lg-4">
          <h6>{tt('Pay security with paypal')}</h6>
          <div className="pay-box">
            <span className="img" />
            <div className="row">
              <div className="col-6 col-sm-3 visa" />
              <div className="col-6 col-sm-3 master-card" />
              <div className="col-6 col-sm-3 maestro" />
              <div className="col-6 col-sm-3 amer" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
