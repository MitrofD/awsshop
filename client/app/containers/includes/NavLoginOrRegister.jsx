// @flow
import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';

const NavLoginOrRegister = () => (
  <Fragment>
    <li className="nav-item nav-b rgstr">
      <Link
        className="nav-link"
        to="/register"
      >
        {tt('Register')}
      </Link>
    </li>
    <li className="nav-item">
      <Link
        className="nav-link"
        to="/login"
      >
        {tt('Login')}
      </Link>
    </li>
  </Fragment>
);

export default NavLoginOrRegister;
