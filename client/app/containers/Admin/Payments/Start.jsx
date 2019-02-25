// @flow
import React from 'react';
import { Link } from 'react-router-dom';

const Start = () => (
  <div className="Start text-center">
    <div className="dt mb-3">
      <Link
        className="btn btn-primary btn-lg mb-3 mb-md-0"
        to="/admin/payments/som"
      >
        Last payout - end of {Tools.getPrevMonthName()}
      </Link>
      <Link
        className="btn btn-primary btn-lg ml-0 ml-md-3"
        to="/admin/payments/otsd"
      >
        Last payout - on the same date
      </Link>
    </div>
    <Link
      className="btn btn-primary btn-lg"
      to="/admin/payments/curr"
    >
      Last payout - current time
    </Link>
  </div>
);

export default Start;
