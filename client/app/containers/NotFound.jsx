// @flow
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="NotFound">
    <h1>404</h1>
    <h3>Sorry, page not found</h3>
    <p>
      The link you followed probably
      <br />
      broken or the page has been removed
    </p>
    <Link
      className="btn"
      to="/"
    >
      Back home page
    </Link>
  </div>
);

export default NotFound;
