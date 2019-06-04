// @flow
import React from 'react';
import { hot } from 'react-hot-loader/root';
import { NavLink, Switch, Route } from 'react-router-dom';
import Page from '../includes/Page';
import InvitedUsers from './InvitedUsers';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable').default(cN => import(`./${cN}`));

const ImportedProductsPage = Loadable('ImportedProducts');
const PaymentHistoryPage = Loadable('PaymentHistory');
const SoldProductsPage = Loadable('SoldProducts');
const ProductsPage = Loadable('Products');
// const CustomerOrdersPage = Loadable('CustomerOrders');
// const MyOrdersPage = Loadable('MyOrders');

const invitedUsersLink = `${Config.dashboardPath}/invited-users`;
const paymentHistoryLink = `${Config.dashboardPath}/payment-history`;
const productsSoldLink = `${Config.dashboardPath}/products-sold`;
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
          <NavLink to={paymentHistoryLink}>
            {tt('Payment history')}
          </NavLink>
        </li>
        <li>
          <NavLink to={myProductsLink}>
            {tt('My products')}
          </NavLink>
        </li>
        <li>
          <NavLink to={productsSoldLink}>
            {tt('Sold products')}
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
          component={PaymentHistoryPage}
          path={paymentHistoryLink}
        />
        <Route
          component={SoldProductsPage}
          path={productsSoldLink}
        />
        <Route
          component={ProductsPage}
          path={myProductsLink}
        />
      </Switch>
    </div>
  </Page>
);

export default hot(Dashboard);
