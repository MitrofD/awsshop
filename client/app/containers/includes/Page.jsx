// @flow
import React, { Fragment } from 'react';
import Header from './Header';
import Footer from './Footer';
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
  let className = 'innr white-box';

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
      <Footer user={currUser} />
    </Fragment>
  );
};

Page.defaultProps = defaultProps;

export default Page;
