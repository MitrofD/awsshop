// @flow
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { InvalidLabel } from '../components/Label';
import { tt } from '../components/TranslateElement';
import user from '../api/user';

type Props = {
  history: Object,
};

type State = {
  emailError: ?string,
  passwordError: ?string,
  xhrRequest: boolean,
};

const isChangedVal = (val: any) => typeof val === 'string';

class Login extends React.Component<Props, State> {
  email: ?string = null;

  inputChangeTimer: ?TimeoutID = null;

  password: ?string = null;

  emailInput: ?HTMLInputElement;

  unmounted = true;

  constructor(props: Props, context: void) {
    super(props, context);

    this.state = {
      emailError: null,
      passwordError: null,
      xhrRequest: false,
    };

    // binds
    const self: any = this;
    self.onChangeEmailInput = this.onChangeEmailInput.bind(this);
    self.onChangePasswordInput = this.onChangePasswordInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.emailInput) {
      this.emailInput.focus();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopInputChangeTimer();
  }

  onChangeEmailInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Email is required';
    } else if (!Tools.emailRegExp.test(pureVal)) {
      error = 'Email is incorrect';
    }

    this.email = pureVal;
    this.setStateAfterInputChange({
      emailError: error,
    });
  }

  onChangePasswordInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Password is required';
    }

    this.password = pureVal;
    this.setStateAfterInputChange({
      passwordError: error,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const defInputVal = '';
    const rEmail = this.email || defInputVal;
    const rPassword = this.password || defInputVal;

    this.setState({
      xhrRequest: true,
    });

    const toRoute = (route: string) => {
      this.props.history.push(route);
    };

    user.login(rEmail, rPassword).then((uData) => {
      if (!uData.isVerified) {
        toRoute(`/resend-email/${uData.email}`);
        return;
      }

      user.apply(uData);
      const queryObj = Tools.queryToObj(window.location.search);
      const rPath = typeof queryObj.redirect === 'string' ? queryObj.redirect : '/';
      toRoute(rPath);
    }).catch((error) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });

      NotificationBox.danger(error.message);
    });
  }

  setStateAfterInputChange(newState: Object) {
    this.stopInputChangeTimer();

    this.inputChangeTimer = setTimeout(() => {
      this.setState(newState);
    }, Config.inputTimeout);
  }

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  render() {
    const {
      emailError,
      passwordError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      email: inputCN,
      password: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedVal(this.email)) {
      if (emailError) {
        errorLabels.email = <InvalidLabel>{emailError}</InvalidLabel>;
        inputCNs.email += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (isChangedVal(this.password)) {
      if (passwordError) {
        errorLabels.password = <InvalidLabel>{passwordError}</InvalidLabel>;
        inputCNs.password += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    return (
      <div className="Login frm-cntnr">
        <div className="frm">
          <div className="innr animated pulse">
            <div className="ttl">{tt('Login')}</div>
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <div className="form-group">
                <label>
                  {tt('Login')}
                  {' ('}
                  {tt('Email')}
                  )
                </label>
                <input
                  type="text"
                  name="email"
                  autoComplete="email"
                  className={inputCNs.email}
                  onChange={this.onChangeEmailInput}
                  ref={
                    (el) => {
                      this.emailInput = el;
                    }
                  }
                />
                {errorLabels.email}
              </div>
              <div className="form-group">
                <label>{tt('Password')}</label>
                <input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  className={inputCNs.password}
                  onChange={this.onChangePasswordInput}
                />
                {errorLabels.password}
              </div>
              <div className="row btns">
                <div className="col-sm-6">
                  <Link
                    className="btn btn-cancel btn-block"
                    to="/"
                  >
                    {tt('Cancel')}
                  </Link>
                </div>
                <div className="col-sm-6 mt-3 mt-sm-0">
                  <button
                    className="btn btn-primary btn-block"
                    disabled={disabledSubmit}
                    type="submit"
                  >
                    {tt('Login')}
                  </button>
                </div>
              </div>
            </form>
            <Link
              className="lnk bld frt-pwd"
              to="/forgot-password"
            >
              {tt('Forgot your password?')}
            </Link>
            <div className="qstn qstn-accnt">
              {tt('Still no account?')}
            </div>
            <Link
              className="lnk bld ftr-lnk"
              to="/create-shop"
            >
              {tt('Create shop')}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);
