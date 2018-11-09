// @flow
import React from 'react';
import './style.scss';

type Props = {
  className: string,
  children: React$Node,
};

const Alert = (props: Props) => (
  <div
    className={`Alert ${props.className}`}
    role="alert"
  >
    {props.children}
  </div>
);

export default Alert;
