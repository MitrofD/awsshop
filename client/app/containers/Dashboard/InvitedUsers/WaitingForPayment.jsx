// @flow
import React from 'react';
import users from '../../../api/users';

type Props = {};

class WaitingForPayment extends React.PureComponent<Props> {
  componentDidMount() {
    this.unmounted = false;

    const finishWithMess = (mess: string, asError: boolean) => {
      if (this.unmounted) {
        return;
      }

      this.waitingForPayment = mess;
      this.waitingForPaymentCN = `text-${asError ? 'danger' : 'primary'}`;
      this.forceUpdate();
    };

    users.refWaitingForPayment().then((waitingForPayment) => {
      if (this.unmounted) {
        return;
      }

      const pWaitingForPayment = parseFloat(waitingForPayment) || 0;
      let mess = '- - -';

      if (pWaitingForPayment > 0) {
        mess = NumberFormat(pWaitingForPayment);
      }

      finishWithMess(mess, false);
    }).catch((error) => {
      finishWithMess(error.message, true);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  unmounted = true;
  waitingForPayment = '- - -';
  waitingForPaymentCN = 'text-secondary';

  render() {
    return (
      <div className="WaitingForPayment col-sm-6">
        <h2 className={this.waitingForPaymentCN}>Waiting for payment: {this.waitingForPayment}</h2>
      </div>
    );
  }
}

export default WaitingForPayment;
