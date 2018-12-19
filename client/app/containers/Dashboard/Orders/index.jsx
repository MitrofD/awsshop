// @flow
import React, { Fragment } from 'react';
import NoHaveLabel from '../../includes/NoHaveLabel';
import { tt } from '../../../components/TranslateElement';

const Orders = () => (
  <Fragment>
    <div className="ttl">{tt('Orders')}</div>
    <NoHaveLabel>{tt('No have orders')}</NoHaveLabel>
  </Fragment>
);

export default Orders;
