// @flow
import React from 'react';

type Props = {
  items: Object[],
};

const PaymentsList = (props: Props) => (
  <div className="PaymentsList">
    {props.items.map(item => (
      <div key={item.userId}>
        <strong>{item.user}</strong> - {item.quantity} / <span className="text-danger">{NumberFormat(item.earnings)}</span>
      </div>
    ))}
  </div>
);

export default PaymentsList;
