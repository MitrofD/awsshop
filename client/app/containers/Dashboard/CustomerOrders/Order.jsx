// @flow
/*
import React, { Fragment } from 'react';
import { tt } from '../../../components/TranslateElement';
import orders from '../../../api/orders';

type Props = Object;

const Order = (props: Props) => {
  const {
    count,
    image,
    title,
    orderId,
    price,
    status,
    userEmail,
  } = props;

  return (
    <div className="Order col-sm-6">
      <div className="row">
        <div className="col-sm-12">
          <div className="ttl">
#
            {orderId}
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-md-5">
          <img
            alt="main_image"
            className="img-thumbnail"
            src={image}
          />
        </div>
        <div className="col-md-7">
          <p>{title}</p>
        </div>
      </div>
      <div className="row">
        <div className="col-sm-12">
          <div className="inf">
            <div className="itm">
              <strong>
                {tt('Status')}
:
                {' '}
              </strong>
              <a href="#!">{status}</a>
            </div>
            <div className="itm">
              <strong>
                {tt('Customer')}
:
                {' '}
              </strong>
              <a href={`mailto:${userEmail}`}>{userEmail}</a>
            </div>
            <div className="itm">
              <strong>
                {tt('Price')}
:
                {' '}
              </strong>
              <a href="#!">
ETH
                {price}
              </a>
            </div>
            {count > 1 && (
              <Fragment>
                <div className="itm">
                  <strong>
                    {tt('Quantity')}
:
                    {' '}
                  </strong>
                  <a href="#!">{count}</a>
                </div>
                <div className="itm">
                  <strong>
                    {tt('Total price')}
:
                    {' '}
                  </strong>
                  <a href="#!">
ETH
                    {count * price}
                  </a>
                </div>
              </Fragment>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;
*/
