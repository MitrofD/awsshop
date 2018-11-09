// @flow
import React from 'react';
import { Link } from 'react-router-dom';

const NavLogo = () => (
  <Link
    to="/"
    className="navbar-logo"
  >
    <div className="img" />
    Ethshop
  </Link>
);

export default NavLogo;
