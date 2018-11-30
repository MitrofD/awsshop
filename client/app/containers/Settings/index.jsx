// @flow
import React from 'react';
import { NavLink, Switch, Route } from 'react-router-dom';
import Page from '../includes/Page';
import { tt } from '../../components/TranslateElement';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

const ETHAddressPath = Loadable('ETHAddress');
const PasswordPage = Loadable('Password');

const ethAddressLink = `${Config.settingsPath}/eth-address`;

const Settings = () => (
  <Page className="Settings">
    <div className="sprtr" />
    <div className="lft sdbr">
      <div className="ttl">
        {tt('Settings')}
      </div>
      <ul className="lst">
        <li>
          <NavLink
            exact
            to={Config.settingsPath}
          >
            {tt('Password')}
          </NavLink>
        </li>
        <li>
          <NavLink to={ethAddressLink}>
            {tt('ETH address')}
          </NavLink>
        </li>
      </ul>
    </div>
    <div className="rght">
      <Switch>
        <Route
          component={PasswordPage}
          exact
          path={Config.settingsPath}
        />
        <Route
          component={ETHAddressPath}
          path={ethAddressLink}
        />
      </Switch>
    </div>
  </Page>
);

export default asHOT(module)(Settings);
