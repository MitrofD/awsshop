// @flow
import React from 'react';
import { Link } from 'react-router-dom';

const NavLogo = () => (
  <Link
    to="/"
    className="navbar-logo"
  >
    <div className="img" />
    Aws-shop
  </Link>
);

export default NavLogo;
