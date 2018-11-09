// @flow
import React from 'react';
import axios from 'axios';
import AlertDanger from '../components/alerts/AlertDanger';
import AlertSuccess from '../components/alerts/AlertSuccess';
import AlertInfo from '../components/alerts/AlertInfo';
import { tt } from '../components/TranslateElement';
import FindEmailTips from './includes/FindEmailTips';

type Props = {};

type State = {
  alert: React$Node,
  xhrRequest: boolean,
};

class ResentReactivateAccount extends React.PureComponent<Props, State> {
  constructor(props: Props, context: void) {
    super(props, context);

    this.state = {
      alert: null,
      xhrRequest: false,
    };

    // binds
    const self: any = this;
    self.onClickToResentLink = this.onClickToResentLink.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickToResentLink(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();

    this.setState({
      alert: <AlertInfo>Send request.Please wait...</AlertInfo>,
      xhrRequest: true,
    });

    const finishWithAlert = (alert: React$Node) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        alert,
        xhrRequest: false,
      });
    };

    axios.post('/call/wantReactivateAccount').then(() => {
      const alertSuccess = <AlertSuccess>The message has been sent</AlertSuccess>;
      finishWithAlert(alertSuccess);
    }, (error) => {
      const alertDanger = <AlertDanger>{error.response.data}</AlertDanger>;
      finishWithAlert(alertDanger);
    });
  }

  unmounted = true;

  render() {
    const {
      alert,
      xhrRequest,
    } = this.state;

    return (
      <div className="ResentReactivateAccount center-layout">
        <div className="main main-message">
          <div className="logo" />
          <div className="title">{tt('reactivateAccountResentTitle')}</div>
          {alert}
          <div className="text">
            We sent a confirmation email to you. Please follow the instructions to reactivate account verification.
          </div>
          <a
            href="!#"
            onClick={this.onClickToResentLink}
          >
            {tt('reactivateAccountResentMailLink')}&nbsp;&gt;&gt;
          </a>
          <FindEmailTips />
        </div>
      </div>
    );
  }
}

export default ResentReactivateAccount;
