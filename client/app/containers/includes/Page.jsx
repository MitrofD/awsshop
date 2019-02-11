// @flow
import React, { Fragment } from 'react';
import Header from './Header';
import UserAlerts from './UserAlerts';
import user from '../../api/user';

type Props = {
  className?: ?string,
  children: React$Node,
};

const defaultProps = {
  className: null,
};

const Page = (props: Props) => {
  const currUser = user.get();
  let className = 'innr';

  if (props.className) {
    className += ` ${props.className}`;
  }

  return (
    <Fragment>
      <Header user={currUser} />
      <main className="container">
        <UserAlerts user={currUser} />
        <div className={className}>
          {props.children}
        </div>
      </main>
    </Fragment>
  );
};

Page.defaultProps = defaultProps;

export default Page;
