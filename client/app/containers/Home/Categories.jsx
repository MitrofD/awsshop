// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import { tt } from '../../components/TranslateElement';

export default () => (
  <div className="Categories row">
    <div className="col-md-4 cat cat-1">
      <div className="img" />
      <div className="desc">
        <div className="ttl">{tt('Computers')}</div>
        <Link
          to="/catalog/Computers"
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
        <div className="ttl">{tt('Mobile phones')}</div>
        <Link
          to="/catalog/Mobile phones"
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
        <div className="ttl">{tt('Clothing')}</div>
        <Link
          to="/catalog/Clothing"
          className="btn btn-border"
        >
          {tt('View all')}
          <span className="arr" />
        </Link>
      </div>
    </div>
  </div>
);
