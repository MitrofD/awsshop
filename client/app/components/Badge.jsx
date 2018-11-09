// @flow
import React from 'react';

type ItemProps = {
  children: React$Node,
};

type Props = ItemProps & {
  className: string,
};

const Badge = (props: Props) => <span className={`Badge ${props.className}`}>{props.children}</span>;

const DangerBadge = (props: ItemProps) => <Badge className="danger">{props.children}</Badge>;
const PrimaryBadge = (props: ItemProps) => <Badge className="primary">{props.children}</Badge>;
const SuccessBadge = (props: ItemProps) => <Badge className="success">{props.children}</Badge>;
const WarningBadge = (props: ItemProps) => <Badge className="warning">{props.children}</Badge>;

export {
  DangerBadge,
  PrimaryBadge,
  SuccessBadge,
  WarningBadge,
};

export default Badge;
