// @flow
import React from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import Page from '../includes/Page';
import InvitedUsers from './InvitedUsers';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

const ImportedProductsPage = Loadable('ImportedProducts');
const ProductsPage = Loadable('Products');
const CustomerOrdersPage = Loadable('CustomerOrders');
const MyOrdersPage = Loadable('MyOrders');

const importedProductsLink = `${Config.dashboardPath}/imported-products`;
const invitedUsersLink = `${Config.dashboardPath}/invited-users`;
// const myOrdersLink = `${Config.dashboardPath}/my-orders`;
const myProductsLink = `${Config.dashboardPath}/my-products`;

const Dashboard = () => (
  <Page className="Dashboard">
    <div className="sprtr" />
    <div className="lft sdbr">
      <div className="ttl">
        {tt('Dashboard')}
      </div>
      <ul className="lst">
        <li>
          <NavLink
            exact
            to={Config.dashboardPath}
          >
            {tt('Imported products')}
          </NavLink>
        </li>
        <li>
          <NavLink to={invitedUsersLink}>
            {tt('Invited users')}
          </NavLink>
        </li>
        <li>
          <NavLink to={myProductsLink}>
            {tt('My products')}
          </NavLink>
        </li>
      </ul>
    </div>
    <div className="rght">
      <Switch>
        <Route
          component={ImportedProductsPage}
          exact
          path={Config.dashboardPath}
        />
        <Route
          component={InvitedUsers}
          path={invitedUsersLink}
        />
        <Route
          component={ProductsPage}
          path={myProductsLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Dashboard);
