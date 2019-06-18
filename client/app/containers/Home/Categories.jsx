// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';

export default () => (
  <div className="Categories row">
    <div className="col-md-4 cat cat-1">
      <div className="img" />
      <div className="desc">
        <div className="ttl">{tt('Computer & Office')}</div>
        <Link
          to="/catalog/Consumer%20Electronics"
          className="btn btn-border"
        >
          {tt('View all')}
          <span className="arr" />
        </Link>
      </div>
    </div>
    <div className="col-md-4 cat cat-2">
      <div className="img" />
      <div className="desc">
        <div className="ttl">{tt('Phones & Accessories')}</div>
        <Link
          to="/catalog/Phones%20%26%20Accessories"
          className="btn btn-border"
        >
          {tt('View all')}
          <span className="arr" />
        </Link>
      </div>
    </div>
    <div className="col-md-4 cat cat-3">
      <div className="img" />
      <div className="desc">
        <div className="ttl">{tt('Women’s Clothing')}</div>
        <Link
          to="/catalog/Women’s%20Clothing"
          className="btn btn-border"
        >
          {tt('View all')}
          <span className="arr" />
        </Link>
      </div>
    </div>
  </div>
);
