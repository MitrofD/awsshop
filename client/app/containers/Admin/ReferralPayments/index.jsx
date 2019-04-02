// @flow
import React from 'react';
import History from './History';
import WaitingForPayments from './WaitingForPayments';
import Tabs, { Tab } from '../../../components/Tabs';

const ReferralPayments = () => (
  <div className="ReferralPayments">
    <Tabs>
      <Tab component={WaitingForPayments}>Waiting for payments</Tab>
      <Tab component={History}>History</Tab>
    </Tabs>
  </div>
);

export default ReferralPayments;
