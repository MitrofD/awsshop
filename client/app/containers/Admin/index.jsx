// @flow
import React from 'react';
import { Switch, Route, NavLink } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

const CategoriesPage = Loadable('Categories');
const ProductsPage = Loadable('Products');
const UsersPage = Loadable('Users');

const categoriesLink = `${Config.adminPath}/categories`;
// const productsLink = `${Config.adminPath}/products`;

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
          component={UsersPage}
          exact
          path={Config.adminPath}
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
