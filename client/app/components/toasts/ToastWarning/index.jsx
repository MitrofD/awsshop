// @flow
import React from 'react';
import Toast from '../Toast';
import './style.scss';

const ToastWarning = (props: Object) => (
  <Toast
    {...props}
    className="ToastWarning"
  />
);

export default ToastWarning;
