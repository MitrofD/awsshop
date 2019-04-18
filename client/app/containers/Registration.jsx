// @flow
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import axios from 'axios';
import Checkbox from '../components/Checkbox';
import NumberInput from '../components/NumberInput';
import { InvalidLabel } from '../components/Label';
import { tt } from '../components/TranslateElement';

type Props = {
  history: Object,
};

type State = {
  confirmPasswordError: ?string,
  emailError: ?string,
  firstNameError: ?string,
  lastNameError: ?string,
  passwordError: ?string,
  phoneError: ?string,
  referralCodeError: ?string,
  IAgree: boolean,
  xhrRequest: boolean,
};

const isChangedInputVal = (val: any) => typeof val === 'string';

class Registration extends React.Component<Props, State> {
  confirmPassword: ?string = null;

  email: ?string = null;

  firstName: ?string = null;

  lastName: ?string = null;

  password: ?string = null;

  phone: ?string = null;

  referralCode: ?string = null;

  unmounted = true;

  constructor(props: Props, context: void) {
    super(props, context);
    this.unmounted = true;
    this.inputChangeTimer = null;

    this.state = {
      confirmPasswordError: null,
      emailError: null,
      firstNameError: null,
      lastNameError: null,
      passwordError: null,
      phoneError: null,
      referralCodeError: null,
      IAgree: false,
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangeConfirmPasswordInput = this.onChangeConfirmPasswordInput.bind(this);
    self.onChangeEmailInput = this.onChangeEmailInput.bind(this);
    self.onChangeFirstNameInput = this.onChangeFirstNameInput.bind(this);
    self.onChangeLastNameInput = self.onChangeLastNameInput.bind(this);
    self.onChangePasswordInput = this.onChangePasswordInput.bind(this);
    self.onChangePhoneInput = this.onChangePhoneInput.bind(this);
    self.onChangeReferralCodeInput = this.onChangeReferralCodeInput.bind(this);
    self.onChangeIAgreeCheckbox = this.onChangeIAgreeCheckbox.bind(this);
    self.onSetFirstInput = self.onSetFirstInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.firstInput) {
      this.firstInput.focus();
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

  onChangeFirstNameInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'First name is required';
    }

    this.firstName = pureVal;
    this.setStateAfterInputChange({
      firstNameError: error,
    });
  }

  onChangeLastNameInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Last name is required';
    }

    this.lastName = pureVal;
    this.setStateAfterInputChange({
      lastNameError: error,
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

  onChangePhoneInput(input: HTMLInputElement) {
    const pureVal = input.value.trim();
    this.phone = pureVal;
  }

  onChangeReferralCodeInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    this.referralCode = pureVal;
    this.setStateAfterInputChange({
      referralCodeError: null,
    });
  }

  onSetFirstInput(el: ?HTMLInputElement) {
    this.firstInput = el;
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

    axios.post(`${proxyPath}/registration`, {
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      password: this.password,
      phone: this.phone,
      referralCode: this.referralCode,
    }).then(({ data }) => {
      if (data.data) {
        const user = data.data;
        this.props.history.push(`/email-verification-sended/${user.email}`);
        return;
      }

      const pureErrors = Tools.getErrorsObj(data.errors);
      finishWithState(pureErrors);
    }).catch((error) => {
      NotificationBox.danger(error.response.data);
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

  firstInput: ?HTMLInputElement;

  inputChangeTimer: ?TimeoutID;

  render() {
    const {
      confirmPasswordError,
      emailError,
      firstNameError,
      lastNameError,
      passwordError,
      phoneError,
      referralCodeError,
      IAgree,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      confirmPassword: inputCN,
      email: inputCN,
      firstName: inputCN,
      lastName: inputCN,
      password: inputCN,
      phone: inputCN,
      referralCode: inputCN,
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

    if (isChangedInputVal(this.firstName)) {
      if (firstNameError) {
        errorLabels.firstName = <InvalidLabel>{firstNameError}</InvalidLabel>;
        inputCNs.firstName += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (isChangedInputVal(this.lastName)) {
      if (lastNameError) {
        errorLabels.lastName = <InvalidLabel>{lastNameError}</InvalidLabel>;
        inputCNs.lastName += errorCNPrefix;
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

    if (phoneError) {
      errorLabels.phone = <InvalidLabel>{phoneError}</InvalidLabel>;
      inputCNs.phone += errorCNPrefix;
    }

    if (referralCodeError) {
      errorLabels.referralCode = <InvalidLabel>{referralCodeError}</InvalidLabel>;
      inputCNs.referralCode += errorCNPrefix;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0 || !IAgree;
    const optional = tt('Optional');

    return (
      <div className="Registration frm-cntnr">
        <div className="frm">
          <div className="innr animated pulse">
            <div className="ttl">{tt('Create shop')}</div>
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <div className="row">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      {tt('First name')}
                      <sup className="text-danger">*</sup>
                    </label>
                    <input
                      autoComplete="first-name"
                      className={inputCNs.firstName}
                      onChange={this.onChangeFirstNameInput}
                      name="firstName"
                      type="text"
                      ref={this.onSetFirstInput}
                    />
                    {errorLabels.firstName}
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label>
                      {tt('Last name')}
                      <sup className="text-danger">*</sup>
                    </label>
                    <input
                      autoComplete="last-name"
                      className={inputCNs.lastName}
                      onChange={this.onChangeLastNameInput}
                      name="lastName"
                      type="text"
                    />
                    {errorLabels.lastName}
                  </div>
                </div>
              </div>
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
                  {tt('Phone number')}
                  {' '}
(
                  {optional}
)
                </label>
                <NumberInput
                  disableDecimal
                  className={inputCNs.phone}
                  onChange={this.onChangePhoneInput}
                  name="phone"
                />
                {errorLabels.phone}
              </div>
              <div className="form-group">
                <label>
                  {tt('Referral code')}
                  {' '}
(
                  {optional}
)
                </label>
                <input
                  className={inputCNs.referralCode}
                  onChange={this.onChangeReferralCodeInput}
                  name="referralCode"
                  type="text"
                />
                {errorLabels.referralCode}
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
