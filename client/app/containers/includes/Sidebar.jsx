// @flow
import React from 'react';

type Props = {
  children: React$Node[],
  title?: React$Node,
};

const defaultProps = {
  title: null,
};

const Sidebar = (props: Props) => (
  <div className="Sidebar">
    {props.title && <div className="ttl">{props.title}</div>}
    <ul className="lst">
      {props.children.map((item, idx) => {
        const key = `itm_${idx}`;
        return <li key={key}>{item}</li>;
      })}
    </ul>
  </div>
);

Sidebar.defaultProps = defaultProps;

export default Sidebar;
