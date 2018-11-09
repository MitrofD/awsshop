// @flow
import React from 'react';
import Toast from '../Toast';
import './style.scss';

const ToastDanger = (props: Object) => (
  <Toast
    {...props}
    className="ToastDanger"
  />
);

export default ToastDanger;
