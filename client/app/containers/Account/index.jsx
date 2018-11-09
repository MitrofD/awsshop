// @flow
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Header from '../includes/Header';
import user from '../../api/user';

const { Loadable } = require('../../components/Loadable')(cN => import(`./${cN}`));

// const DashboardPage = Loadable('Dashboard');
// const PasswordPage = Loadable('Password');

const Account = () => {
  const rootPath = Config.accountCenterPath;
  const currUser = user.get();

  return (
    <div className="Account">
      <Header user={currUser} />
      <div className="container">
        ololo
      </div>
    </div>
  );
};

export default Account;
