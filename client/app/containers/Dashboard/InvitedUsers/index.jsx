// @flow
import React from 'react';
import List from './List';
import ReferralCode from './ReferralCode';
import WaitingForPayment from './WaitingForPayment';

const InvitedUsers = () => (
  <div className="InvitedUsers">
    <div className="row">
      <ReferralCode />
      <WaitingForPayment />
    </div>
    <List />
  </div>
);

export default InvitedUsers;
