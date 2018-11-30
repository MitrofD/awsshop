// @flow
import React from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

const ImportedProductsPage = Loadable('ImportedProducts');
const ProductsPage = Loadable('Products');
const OrdersPage = Loadable('Orders');

const ordersLink = `${Config.dashboardPath}/orders`;
const productsLink = `${Config.dashboardPath}/products`;

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
          <NavLink
            to={productsLink}
          >
            {tt('Products')}
          </NavLink>
        </li>
        <li>
          <NavLink to={ordersLink}>
            {tt('Orders')}
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
          component={ProductsPage}
          path={productsLink}
        />
        <Route
          component={OrdersPage}
          path={ordersLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Dashboard);
