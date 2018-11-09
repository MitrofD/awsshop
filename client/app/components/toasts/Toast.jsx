// @flow
import React from 'react';
import './style.scss';

type Props = {
  children: React$Node,
  className: string,
};

const Toast = (props: Props) => (
  <div className={`Toast ${props.className}`}>
    {props.children}
  </div>
);

export default Toast;
