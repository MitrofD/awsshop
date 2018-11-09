// @flow
import React from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

type Props = {
  verificationCode: string,
};

type State = {
  xhrRequest: boolean,
  errorMessage: ?string,
};

class EmailVerification extends React.PureComponent<Props, State> {
  state = {
    xhrRequest: true,
    errorMessage: null,
  };

  componentDidMount() {
    this.unmounted = false;

    const answerWithObj = (obj: Object) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        ...obj,
        xhrRequest: false,
      });
    };

    axios.post('/call/emailVerification', {
      verificationCode: this.props.verificationCode,
    }).then(({ data }) => {
      if (!data.ok) {
        answerWithObj({
          errorMessage: 'Please check your activation link and try again.',
        });
        return;
      }

      answerWithObj({});
    }, (error) => {
      answerWithObj({
        errorMessage: error.response.data,
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  unmounted = true;

  render() {
    const {
      xhrRequest,
      errorMessage,
    } = this.state;

    let message = 'Trying to verification';
    let loginLink = null;

    if (!xhrRequest) {
      message = errorMessage;
      loginLink = <Link to="/login">Login</Link>;

      if (!message) {
        message = 'Your account is activated. Please login to trade';
      }
    }

    return (
      <div className="EmailVerification frm-cntnr">
        <div className="frm">
          <div className="innr">
            {message} {loginLink}
          </div>
        </div>
      </div>
    );
  }
}

export default EmailVerification;
