// @flow
import React from 'react';
import { tt } from '../../../components/TranslateElement';

type Props = {};

class Users extends React.PureComponent<Props> {
  componentDidMount() {
    this.unmounted = false;
  }

  cpmponentWillUnmount() {
    this.unmounted = true;
  }

  unmounted = true;

  render() {
    return (
      <div className="Users">
        <div className="ttl">{tt('Users')}</div>
      </div>
    );
  }
}

export default Users;
