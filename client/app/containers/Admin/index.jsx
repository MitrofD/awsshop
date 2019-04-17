// @flow
import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable').default(cN => import(`./${cN}`));

const CategoriesPage = Loadable('Categories');
const FAQsPage = Loadable('FAQs');
const LoginsHistoryPage = Loadable('LoginsHistory');
const PaymentsPage = Loadable('Payments');
const ReferralPaymentsPage = Loadable('ReferralPayments');
const PagesPage = Loadable('Pages');
const ProductsPage = Loadable('Products');
const SettingsPage = Loadable('Settings');
const SupportPage = Loadable('Support');
const UsersPage = Loadable('Users');

const faqsLink = `${Config.adminPath}/faqs`;
const loginsHistoryLink = `${Config.adminPath}/logins-history`;
const paymentsLink = `${Config.adminPath}/payments`;
const referralPaymentsLink = `${Config.adminPath}/referral-payments`;
const pagesLink = `${Config.adminPath}/pages`;
const productsLink = `${Config.adminPath}/products`;
const settingsLink = `${Config.adminPath}/settings`;
const supportLink = `${Config.adminPath}/support`;
const usersLink = `${Config.adminPath}/users`;

const Admin = () => (
  <Page className="Admin">
    <div className="sprtr" />
    <div className="lft sdbr">
      <div className="ttl">{tt('Admin panel')}</div>
      <ul className="lst">
        <li>
          <NavLink
            exact
            to={Config.adminPath}
          >
            {tt('Categories')}
          </NavLink>
        </li>
        <li>
          <NavLink to={faqsLink}>
            {tt('FAQ items')}
          </NavLink>
        </li>
        <li>
          <NavLink to={loginsHistoryLink}>
            {tt('Logins history')}
          </NavLink>
        </li>
        <li>
          <NavLink to={paymentsLink}>
            {tt('Payments')}
          </NavLink>
        </li>
        <li>
          <NavLink to={referralPaymentsLink}>
            {tt('Referral payments')}
          </NavLink>
        </li>
        <li>
          <NavLink to={pagesLink}>
            {tt('Pages')}
          </NavLink>
        </li>
        <li>
          <NavLink to={productsLink}>
            {tt('Products')}
          </NavLink>
        </li>
        <li>
          <NavLink to={settingsLink}>
            {tt('Settings')}
          </NavLink>
        </li>
        <li>
          <NavLink to={supportLink}>
            {tt('Support')}
          </NavLink>
        </li>
        <li>
          <NavLink to={usersLink}>
            {tt('Users')}
          </NavLink>
        </li>
      </ul>
    </div>
    <div className="rght">
      <Switch>
        <Route
          component={CategoriesPage}
          exact
          path={Config.adminPath}
        />
        <Route
          component={FAQsPage}
          path={faqsLink}
        />
        <Route
          component={LoginsHistoryPage}
          path={loginsHistoryLink}
        />
        <Route
          component={PaymentsPage}
          path={paymentsLink}
        />
        <Route
          component={ReferralPaymentsPage}
          path={referralPaymentsLink}
        />
        <Route
          component={PagesPage}
          path={pagesLink}
        />
        <Route
          component={ProductsPage}
          path={productsLink}
        />
        <Route
          component={SettingsPage}
          path={settingsLink}
        />
        <Route
          component={SupportPage}
          path={supportLink}
        />
        <Route
          component={UsersPage}
          path={usersLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Admin);
