// @flow
import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const {
  Loadable,
  LoadableWithParams,
} = require('../../components/Loadable')(cN => import(`./${cN}`));

const ActiveOrdersPage = LoadableWithParams('Orders', {
  isActive: true,
});

const CategoriesPage = Loadable('Categories');
const OrdersHistoryPage = LoadableWithParams('Orders');
const UsersPage = Loadable('Users');

const categoriesLink = `${Config.adminPath}/categories`;
const ordersHistoryLink = `${Config.adminPath}/orders-history`;
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
            {tt('Active orders')}
          </NavLink>
        </li>
        <li>
          <NavLink to={ordersHistoryLink}>
            {tt('Orders history')}
          </NavLink>
        </li>
        <li>
          <NavLink to={usersLink}>
            {tt('Users')}
          </NavLink>
        </li>
        <li>
          <NavLink to={categoriesLink}>
            {tt('Categories')}
          </NavLink>
        </li>
      </ul>
    </div>
    <div className="rght">
      <Switch>
        <Route
          component={ActiveOrdersPage}
          exact
          path={Config.adminPath}
        />
        <Route
          component={OrdersHistoryPage}
          path={ordersHistoryLink}
        />
        <Route
          component={UsersPage}
          path={usersLink}
        />
        <Route
          component={CategoriesPage}
          path={categoriesLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Admin);
