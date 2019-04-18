// @flow
import React, { Fragment } from 'react';
import { tt } from '../../../components/TranslateElement';
import orders from '../../../api/orders';

type Props = {
  data: Object,
  didChange: (Object) => void,
};

type State = {
  disabledButtons: boolean,
  status: string,
};

class Order extends React.PureComponent<Props, State> {
  orderStatuses: string[] = Object.keys(orders.STATUS);

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      status: props.data.status,
      disabledButtons: false,
    };

    const self: any = this;
    self.onClickStatusButton = this.onClickStatusButton.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickStatusButton(event: SyntheticEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    const { status } = button.dataset;

    this.setState({
      disabledButtons: true,
    });

    const setStatus = (newStatus: string) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        disabledButtons: false,
        status: newStatus,
      });
    };

    orders.update(this.props.data._id, {
      status,
    }).then((order) => {
      setStatus(order.status);
      this.props.didChange(order);
    }).catch((error) => {
      NotificationBox.danger(error.message);
      setStatus(this.state.status);
    });
  }

  render() {
    const {
      count,
      image,
      title,
      orderId,
      ownerEmail,
      price,
      userEmail,
    } = this.props.data;

    const {
      disabledButtons,
      status,
    } = this.state;

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
            <div className="btn-group btn-group-sm float-right">
              {this.orderStatuses.map((orderStatus) => {
                let itemClassName = 'btn btn-warning';

                if (orderStatus === status) {
                  itemClassName += ' active';
                }

                return (
                  <button
                    className={itemClassName}
                    data-status={orderStatus}
                    disabled={disabledButtons}
                    key={orderStatus}
                    onClick={this.onClickStatusButton}
                    type="button"
                    status={orderStatus}
                  >
                    {orderStatus}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="inf">
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
                  {tt('Owner')}
:
                  {' '}
                </strong>
                <a href={`mailto:${ownerEmail}`}>{ownerEmail}</a>
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
  }
}

export default Order;
