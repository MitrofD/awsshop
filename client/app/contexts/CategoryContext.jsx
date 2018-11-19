// @flow
import React from 'react';

const CategoryContext = React.createContext(null);

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

export { withCategory };
export default CategoryContext;
