// @flow
import React from 'react';
import Alert from '../Alert';
import './style.scss';

const AlertDanger = (props: Object) => (
  <Alert
    {...props}
    className="AlertDanger"
  />
);

export default AlertDanger;
