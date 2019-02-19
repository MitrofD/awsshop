// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';
import user from '../../../api/user';

const ReferralCode = () => {
  let pureRefCode = '- - -';

  const currUser = user.get();

  if (currUser) {
    pureRefCode = currUser.referralCode;
  }

  const onClickReferralCode = (event: SyntheticEvent<HTMLElement>) => {
    event.preventDefault();
    const rBody = document.body;

    if (rBody) {
      const input = document.createElement('input');
      input.type = 'text';
      input.style.position = 'fixed';
      input.value = pureRefCode;
      rBody.appendChild(input);
      input.select();

      try {
        document.execCommand('copy');
        // eslint-disable-next-line no-empty
      } catch (copyErr) {}

      NotificationBox.success(`Referral code "${pureRefCode}" is copied`);
      rBody.removeChild(input);
    }
  };

  return (
    <a
      className="ReferralCode row"
      href="#"
      onClick={onClickReferralCode}
    >
      <div className="col-sm-12">
        <div className="info animated pulse">{tt('Referral code')}: {pureRefCode}</div>
        ({tt('Click to copy')})
      </div>
    </a>
  );
};

export default ReferralCode;
