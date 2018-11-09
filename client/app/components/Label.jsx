// @flow
import React from 'react';

type Props = {
  children: string,
};

const commonPartCN = '-feedback animated fadeIn';

const InvalidLabel = (props: Props) => (
  <div className={`invalid${commonPartCN}`}>{props.children}</div>
);

const ValidLabel = (props: Props) => (
  <div className={`valid${commonPartCN}`}>{props.children}</div>
);

export {
  InvalidLabel,
  ValidLabel,
};

export default {
  InvalidLabel,
  ValidLabel,
};
