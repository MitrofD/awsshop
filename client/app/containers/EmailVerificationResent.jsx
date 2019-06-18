// @flow
import React from 'react';
import axios from 'axios';
import AlertDanger from '../components/alerts/AlertDanger';
import AlertSuccess from '../components/alerts/AlertSuccess';
import AlertInfo from '../components/alerts/AlertInfo';
import { tt } from '../components/TranslateElement';
import FindEmailTips from './includes/FindEmailTips';

type Props = {
  email: string,
  advancedMessage?: string,
};

type State = {
  alert: React$Node,
  xhrRequest: boolean,
};

const defaultProps = {
  advancedMessage: null,
};

class EmailVerificationResent extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  unmounted = true;

  constructor(props: Props, context: void) {
    super(props, context);

    this.state = {
      alert: null,
      xhrRequest: false,
    };

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

    if (this.state.xhrRequest) {
      return;
    }

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

    axios.post(`${proxyPath}/resentRegisterMail`, {
      email: this.props.email,
    }).then(() => {
      const alertSuccess = <AlertSuccess>The message has been sent</AlertSuccess>;
      finishWithAlert(alertSuccess);
    }, (error) => {
      const alertDanger = <AlertDanger>{error.response.data}</AlertDanger>;
      finishWithAlert(alertDanger);
    });
  }

  render() {
    const {
      advancedMessage,
      email,
    } = this.props;

    const rAdvancedMessage = advancedMessage ? `${advancedMessage}.` : null;

    return (
      <div className="EmailVerificationResent frm-cntnr">
        <div className="frm">
          <div className="innr animated pulse">
            <div className="ttl">{tt('Email sent')}</div>
            {this.state.alert}
            <p>
              {rAdvancedMessage}
              {' We sent a confirmation email to'}
              <strong>
                &nbsp;
                {email}
              </strong>
              .Please follow the instructions to complete your registration.
              <a
                href="#!"
                onClick={this.onClickToResentLink}
              >
                {tt('Resend email')}
              </a>
            </p>
            <FindEmailTips />
          </div>
        </div>
      </div>
    );
  }
}

export default EmailVerificationResent;
