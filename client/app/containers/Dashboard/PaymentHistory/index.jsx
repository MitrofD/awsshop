// @flow
import React from 'react';
import All from './All';
import ByMonth from './ByMonth';
import WaitingForPayment from './WaitingForPayment';
import Tabs, { Tab } from '../../../components/Tabs';

const PaymentHistory = () => (
  <div className="PaymentHistory">
    <WaitingForPayment />
    <Tabs>
      <Tab component={ByMonth}>Group by month</Tab>
      <Tab component={All}>All payments</Tab>
    </Tabs>
  </div>
);

export default PaymentHistory;
