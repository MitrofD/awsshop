// @flow
import React from 'react';

const Checkbox = (props: Object) => (
  <span className="Checkbox">
    <input
      {...props}
      type="checkbox"
    />
    <span className="tmblr" />
  </span>
);

export default Checkbox;
