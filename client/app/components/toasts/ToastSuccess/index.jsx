// @flow
import React from 'react';
import Toast from '../Toast';
import './style.scss';

const ToastSuccess = (props: Object) => (
  <Toast
    {...props}
    className="ToastSuccess"
  />
);

export default ToastSuccess;
