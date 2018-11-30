// @flow
import React from 'react';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import user from '../../../api/user';

type Props = {};

type State = {
  confirmPasswordError: ?string,
  oldPasswordError: ?string,
  passwordError: ?string,
  xhrRequest: boolean,
};

const isChangedVal = (val: any) => val !== null;

class Password extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      confirmPasswordError: null,
      oldPasswordError: null,
      passwordError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangeConfirmPasswordInput = this.onChangeConfirmPasswordInput.bind(this);
    self.onChangeOldPasswordInput = this.onChangeOldPasswordInput.bind(this);
    self.onChangePasswordInput = this.onChangePasswordInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
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

  onChangeOldPasswordInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Old password is required';
    }

    this.oldPassword = pureVal;
    this.setStateAfterInputChange({
      oldPasswordError: error,
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

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    this.setState({
      xhrRequest: true,
    });

    user.safeUpdate({
      currPassword: this.oldPassword,
      password: this.password,
    }).then((data) => {
      if (this.unmounted) {
        return;
      }

      const setObj = {
        xhrRequest: false,
      };

      if (data.errors) {
        const pureErrors = Tools.getErrorsObj(data.errors);
        Object.assign(setObj, pureErrors);
      } else {
        NotificationBox.success('Password has been changed');
        form.reset();
      }

      this.setStateAfterRequest(setObj);
    }).catch((error) => {
      NotificationBox.danger(error.message);
      this.setStateAfterRequest({});
    });
  }

  setStateAfterRequest(newState: Object) {
    if (this.unmounted) {
      return;
    }

    const pureState = Object.assign({
      xhrRequest: false,
    }, newState);

    this.setState(pureState);
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
  oldPassword: ?string = null;
  inputChangeTimer: ?TimeoutID = null;
  password: ?string = null;
  unmounted = true;

  render() {
    const {
      confirmPasswordError,
      oldPasswordError,
      passwordError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      confirmPassword: inputCN,
      oldPassword: inputCN,
      password: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedVal(this.oldPassword)) {
      if (oldPasswordError) {
        errorLabels.oldPassword = <InvalidLabel>{oldPasswordError}</InvalidLabel>;
        inputCNs.oldPassword += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    if (isChangedVal(this.password)) {
      if (passwordError) {
        errorLabels.password = <InvalidLabel>{passwordError}</InvalidLabel>;
        inputCNs.password += errorCNPrefix;
      }

      if (isChangedVal(this.confirmPassword)) {
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
      <div className="Password">
        <div className="ttl">{tt('Change password')}</div>
        <div className="dt row">
          <form
            className="col-sm-12 col-md-6"
            noValidate
            onSubmit={this.onSubmitForm}
          >
            <div className="form-group">
              <label>{tt('Current password')}</label>
              <input
                autoComplete="new-password"
                className={inputCNs.oldPassword}
                onChange={this.onChangeOldPasswordInput}
                type="password"
              />
              {errorLabels.oldPassword}
            </div>
            <div className="form-group">
              <label>{tt('New password')}</label>
              <input
                autoComplete="new-password"
                className={inputCNs.password}
                onChange={this.onChangePasswordInput}
                type="password"
              />
              {errorLabels.password}
            </div>
            <div className="form-group">
              <label>{tt('Confirm password')}</label>
              <input
                autoComplete="new-password"
                className={inputCNs.confirmPassword}
                onChange={this.onChangeConfirmPasswordInput}
                type="password"
              />
              {errorLabels.confirmPassword}
            </div>
            <button
              className="btn btn-primary float-right"
              disabled={disabledSubmit}
              type="submit"
            >
              {tt('Save changes')}
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default Password;
