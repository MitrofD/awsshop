// @flow
import React from 'react';
import './style.scss';

const defHeight = 100;
const defWidth = 100;

type Props = {
  asHolder?: boolean,
  children?: React$Node,
  className?: ?string,
  height?: number,
  width?: number,
};

const defaultProps = {
  asHolder: false,
  children: null,
  className: null,
  height: defHeight,
  width: defWidth,
};

const getPureNum = (val: any, defVal: number) => {
  const numVal = parseFloat(val);
  return Number.isNaN(numVal) ? defVal : numVal;
};

const getPureSize = (props: Props) => {
  const pureHeight = getPureNum(props.height, defHeight);
  const pureWidth = getPureNum(props.width, defWidth);

  return {
    height: pureHeight,
    width: pureWidth,
  };
};

const Spin = (props: Props) => {
  const {
    asHolder,
    children,
    className,
  } = props;

  const pureSize = getPureSize(props);

  const rStyle = {
    height: `${pureSize.height}px`,
    marginTop: `-${pureSize.height * 0.5}px`,
    marginLeft: `-${pureSize.width * 0.5}px`,
    width: `${pureSize.width}px`,
  };

  let rClassName = 'Spin';

  if (className) {
    rClassName += ` ${className}`;
  }

  const spinner = (
    <div className={rClassName}>
      <div
        className="insd"
        style={rStyle}
      >
        {children}
      </div>
    </div>
  );

  return asHolder ? (
    <div className="SpinBG">
      {spinner}
    </div>
  ) : spinner;
};

Spin.defaultProps = defaultProps;

export { getPureSize };
export default Spin;
