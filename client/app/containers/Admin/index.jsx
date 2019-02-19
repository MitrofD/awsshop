// @flow
import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const {
  Loadable,
  LoadableWithParams,
} = require('../../components/Loadable')(cN => import(`./${cN}`));

/*
const ActiveOrdersPage = LoadableWithParams('Orders', {
  isActive: true,
});
*/

const CategoriesPage = Loadable('Categories');
const LoginsHistoryPage = Loadable('LoginsHistory');
const PaymentsPage = LoadableWithParams('Payments');
const ProductsPage = LoadableWithParams('Products');
// const OrdersHistoryPage = LoadableWithParams('Orders');
const SettingsPage = Loadable('Settings');
const UsersPage = Loadable('Users');

const loginsHistoryLink = `${Config.adminPath}/logins-history`;
// const ordersHistoryLink = `${Config.adminPath}/orders-history`;
// const ordersLink = `${Config.adminPath}/orders`;
const paymentsLink = `${Config.adminPath}/payments`;
const productsLink = `${Config.adminPath}/products`;
const settingsLink = `${Config.adminPath}/settings`;
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
          component={LoginsHistoryPage}
          path={loginsHistoryLink}
        />
        <Route
          component={PaymentsPage}
          path={paymentsLink}
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
          component={UsersPage}
          path={usersLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Admin);
