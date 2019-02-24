// @flow
import React from 'react';
import { Link } from 'react-router-dom';

const NavLogo = () => (
  <Link
    to="/"
    className="navbar-logo"
  >
    <div className="img" />
    Awesome shop
  </Link>
);

export default NavLogo;
