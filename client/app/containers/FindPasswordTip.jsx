// @flow
import React from 'react';
import FindEmailTips from './includes/FindEmailTips';
import { tt } from '../components/TranslateElement';

const FindPasswordTip = () => (
  <div className="FindPasswordTip frm-cntnr">
    <div className="frm">
      <div className="innr animated pulse">
        <div className="ttl">{tt('Reset Login Password')}</div>
        <p>
          We sent a confirmation email to you. Please follow the instructions to reset login password.
        </p>
        <FindEmailTips />
      </div>
    </div>
  </div>
);

export default FindPasswordTip;
