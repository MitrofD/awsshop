// @flow
import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Sidebar from '../includes/Sidebar';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

const CategoriesPage = Loadable('Categories');
const ProductsPage = Loadable('Products');
const UsersPage = Loadable('Users');

const categoriesLink = `${Config.adminPath}/categories`;
const productsLink = `${Config.adminPath}/products`;

const Admin = () => (
  <Page className="Admin">
    <div className="lft">
      <Sidebar title={tt('Navigation')}>
        <NavLink
          exact
          to={Config.adminPath}
        >
          {tt('Users')}
        </NavLink>
        <NavLink to={categoriesLink}>{tt('Categories')}</NavLink>
        <NavLink to={productsLink}>{tt('Products')}</NavLink>
      </Sidebar>
    </div>
    <div className="rght">
      <Switch>
        <Route
          component={CategoriesPage}
          path={categoriesLink}
        />
        <Route
          component={ProductsPage}
          path={productsLink}
        />
        <Route
          component={UsersPage}
          path={Config.adminPath}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Admin);
