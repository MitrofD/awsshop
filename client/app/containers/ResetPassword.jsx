// @flow
import React from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import { InvalidLabel } from '../components/Label';
import AlertDanger from '../components/alerts/AlertDanger';
import AlertSuccess from '../components/alerts/AlertSuccess';
import { tt } from '../components/TranslateElement';

type Props = {
  verificationCode: string,
  history: Object,
};

type State = {
  alert: React$Node,
  confirmPasswordError: ?string,
  passwordError: ?string,
  xhrRequest: boolean,
};

const isChangedInputVal = (val: any) => typeof val === 'string';

class ResetPassword extends React.PureComponent<Props, State> {
  confirmPassword: ?string = null;

  password: ?string = null;

  unmounted = true;

  constructor(props: Props, context: void) {
    super(props, context);

    this.state = {
      alert: null,
      confirmPasswordError: null,
      passwordError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangePasswordInput = this.onChangePasswordInput.bind(this);
    self.onChangeConfirmPasswordInput = this.onChangeConfirmPasswordInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    if (this.redirectTimeout) {
      clearTimeout(this.redirectTimeout);
    }

    this.unmounted = true;
  }

  onChangePasswordInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Password is required';
    } else if (!Tools.passwordRegExp.test(pureVal)) {
      error = 'Password has to be least 8 characters with uppercase letters and numbers';
    }

    this.password = pureVal;
    this.setStateAfterInputChange({
      passwordError: error,
    });
  }

  onChangeConfirmPasswordInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Confirm password is required';
    } else if (this.password !== pureVal) {
      error = 'Confirm password do not match';
    }

    this.confirmPassword = pureVal;
    this.setStateAfterInputChange({
      confirmPasswordError: error,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({
      alert: null,
      xhrRequest: true,
    });

    const finishWithAlert = (alert: React$Node) => {
      if (this.unmounted) {
        return;
      }

      const stateData = {
        alert,
        xhrRequest: false,
      };

      this.setState(stateData);
    };

    axios.post(`${proxyPath}/resetPassword`, {
      password: this.password,
      verificationCode: this.props.verificationCode,
    }).then(() => {
      const alertSuccess = <AlertSuccess>Reset password successful.</AlertSuccess>;
      finishWithAlert(alertSuccess);
      this.redirectTimeout = setTimeout(() => {
        this.props.history.push('/login');
      }, 1500);
    }).catch((error) => {
      const alertDanger = <AlertDanger>{error.response.data}</AlertDanger>;
      finishWithAlert(alertDanger);
    });
  }

  setStateAfterInputChange(newState: Object) {
    this.stopInputChangeTimer();

    this.inputChangeTimer = setTimeout(() => {
      this.setState(newState);
    }, Config.inputChangeTimer);
  }

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  inputChangeTimer: ?TimeoutID;

  redirectTimeout: ?TimeoutID;

  render() {
    const {
      alert,
      confirmPasswordError,
      passwordError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      confirmPassword: inputCN,
      password: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedInputVal(this.password)) {
      if (passwordError) {
        errorLabels.password = <InvalidLabel>{passwordError}</InvalidLabel>;
        inputCNs.password += errorCNPrefix;
      }

      if (isChangedInputVal(this.confirmPassword)) {
        if (confirmPasswordError) {
          errorLabels.confirmPassword = <InvalidLabel>{confirmPasswordError}</InvalidLabel>;
          inputCNs.confirmPassword += errorCNPrefix;
        }
      } else {
        allInputsChanged = false;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    return (
      <div className="ResetPassword frm-cntnr">
        <div className="frm">
          <div className="innr">
            <div className="ttl">{tt('Set new password')}</div>
            {alert}
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <div className="form-group">
                <label>{tt('New password')}</label>
                <input
                  autoComplete="new-password"
                  className={inputCNs.password}
                  name="password"
                  type="password"
                  onChange={this.onChangePasswordInput}
                />
                {errorLabels.password}
              </div>
              <div className="form-group">
                <label>{tt('Confirm new password')}</label>
                <input
                  autoComplete="new-password"
                  className={inputCNs.confirmPassword}
                  name="confirmPassword"
                  type="password"
                  onChange={this.onChangeConfirmPasswordInput}
                />
                {errorLabels.confirmPassword}
              </div>
              <div className="btn-wrap">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={disabledSubmit}
                >
                  {tt('Create password')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ResetPassword);
