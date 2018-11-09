// @flow
import React from 'react';
import Spin, { getPureSize } from '../Spin';
import './style.scss';

const ScaleBouncesSpin = (props: Object) => {
  const pureSize = getPureSize(props);
  const min = Math.min(pureSize.height, pureSize.width);
  const height = min / 3;

  return (
    <Spin
      {...props}
      height={height}
      width={min}
      className="ScaleBouncesSpin"
    >
      <div className="bnc1" />
      <div className="bnc2" />
      <div className="bnc3" />
    </Spin>
  );
};

export default ScaleBouncesSpin;
