// @flow
import React from 'react';

const defVal = null;

const CategoryContext = React.createContext(defVal);

const withCategory = (Component: React.DOM) => {
  const connectedComponent = (props: any) => (
    <CategoryContext.Consumer>
    {category => (
      <Component
        {...props}
        category={category}
      />
    )}
    </CategoryContext.Consumer>
  );

  return connectedComponent;
};

export {
  withCategory,
};

export default CategoryContext;
