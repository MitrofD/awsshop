// @flow
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import ItemsStack from '../components/ItemsStack';
import ToastDanger from '../components/toasts/ToastDanger';
import Checkbox from '../components/Checkbox';
import { InvalidLabel } from '../components/Label';
import { tt, TTInput } from '../components/TranslateElement';

type Props = {
  history: Object,
};

type State = {
  confirmPasswordError: ?string,
  emailError: ?string,
  ethAddressError: ?string,
  passwordError: ?string,
  IAgree: boolean,
  xhrRequest: boolean,
};

const isChangedInputVal = (val: any) => typeof val === 'string';

class Registration extends React.Component<Props, State> {
  constructor(props: Props, context: void) {
    super(props, context);
    this.unmounted = true;
    this.inputChangeTimer = null;

    this.state = {
      confirmPasswordError: null,
      emailError: null,
      ethAddressError: null,
      passwordError: null,
      IAgree: false,
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangeEmailInput = this.onChangeEmailInput.bind(this);
    self.onChangePasswordInput = this.onChangePasswordInput.bind(this);
    self.onChangeConfirmPasswordInput = this.onChangeConfirmPasswordInput.bind(this);
    self.onChangeETHAddressInput = this.onChangeETHAddressInput.bind(this);
    self.onChangeIAgreeCheckbox = this.onChangeIAgreeCheckbox.bind(this);
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

  onChangeETHAddressInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'ETH address is required';
    } else if (!Tools.ethAdressRegExp.test(pureVal)) {
      error = 'ETH address is incorrect';
    }

    this.ethAddress = pureVal;
    this.setStateAfterInputChange({
      ethAddressError: error,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({
      xhrRequest: true,
    });

    const finishWithState = (obj: Object) => {
      if (this.unmounted) {
        return;
      }

      const newState = Object.assign({
        xhrRequest: false,
      }, obj);

      this.setState(newState);
    };

    axios.post('/call/registration', {
      email: this.email,
      ethAddress: this.ethAddress,
      password: this.password,
    }).then(({ data }) => {
      if (data.data) {
        const user = data.data;
        this.props.history.push(`/email-verification-sended/${user.email}`);
        return;
      }

      const pureErrors = Tools.getErrorsObj(data.errors);
      finishWithState(pureErrors);
    }).catch((error) => {
      const setStateSetted = finishWithState({});

      if (setStateSetted) {
        const itemsStack = ItemsStack.get(Enums.GLOB_ITEMS_STACK_NAME);
        const toast = <ToastDanger>{error.response.data}</ToastDanger>;
        itemsStack.add(toast);
      }
    });
  }

  onChangeIAgreeCheckbox(event: SyntheticEvent<HTMLInputElement>) {
    const checkbox = event.currentTarget;

    this.setState({
      IAgree: !!checkbox.checked,
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

  confirmPassword: ?string = null;
  email: ?string = null;
  emailInput: ?HTMLInputElement;
  ethAddress: ?string;
  inputChangeTimer: ?TimeoutID;
  password: ?string = null;
  unmounted: boolean;

  render() {
    const {
      confirmPasswordError,
      emailError,
      ethAddressError,
      passwordError,
      IAgree,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      confirmPassword: inputCN,
      ethAddress: inputCN,
      email: inputCN,
      password: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedInputVal(this.email)) {
      if (emailError) {
        errorLabels.email = <InvalidLabel>{emailError}</InvalidLabel>;
        inputCNs.email += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

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

    if (isChangedInputVal(this.ethAddress)) {
      if (ethAddressError) {
        errorLabels.ethAddress = <InvalidLabel>{ethAddressError}</InvalidLabel>;
        inputCNs.ethAddress += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0 || !IAgree;

    return (
      <div className="Registration frm-cntnr">
        <div className="frm">
          <div className="innr animated pulse">
            <div className="ttl">{tt('Registration')}</div>
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <div className="form-group">
                <label>
                  {tt('Email')}
                  <sup className="text-danger">*</sup>
                </label>
                <input
                  autoComplete="email"
                  className={inputCNs.email}
                  onChange={this.onChangeEmailInput}
                  name="email"
                  type="text"
                  ref={
                    (el) => {
                      this.emailInput = el;
                    }
                  }
                />
                {errorLabels.email}
              </div>
              <div className="form-group">
                <label>
                  {tt('Password')}
                  <sup className="text-danger">*</sup>
                </label>
                <input
                  autoComplete="new-password"
                  className={inputCNs.password}
                  onChange={this.onChangePasswordInput}
                  name="password"
                  type="password"
                />
                {errorLabels.password}
              </div>
              <div className="form-group">
                <label>
                  {tt('Confirm password')}
                  <sup className="text-danger">*</sup>
                </label>
                <input
                  autoComplete="new-password"
                  className={inputCNs.confirmPassword}
                  onChange={this.onChangeConfirmPasswordInput}
                  name="confirmPassword"
                  type="password"
                />
                {errorLabels.confirmPassword}
              </div>
              <div className="form-group">
                <label>
                  {tt('Etherium public address')}
                  <sup className="text-danger">*</sup>
                </label>
                <input
                  className={inputCNs.ethAddress}
                  onChange={this.onChangeETHAddressInput}
                  name="ethAddress"
                  type="password"
                  placeholder="Ex: 0xda184e54416525de03da629d3ac85280802f55e8"
                />
                {errorLabels.ethAddress}
              </div>
              <label className="chckkbx">
                <Checkbox onChange={this.onChangeIAgreeCheckbox} />
                {tt('I accept the terms of the site')}
              </label>
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
                    {tt('Registration')}
                  </button>
                </div>
              </div>
            </form>
            <div className="qstn qstn-accnt">
              {tt('Already have an account?')}
            </div>
            <Link
              className="lnk bld ftr-lnk"
              to="/login"
            >
              {tt('Login')}
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Registration);
