// @flow
import React from 'react';
import axios from 'axios';
import { Link, withRouter } from 'react-router-dom';
import ItemsStack from '../components/ItemsStack';
import ToastDanger from '../components/toasts/ToastDanger';
import { InvalidLabel } from '../components/Label';
import { tt } from '../components/TranslateElement';

type Props = {
  history: Object,
};

type State = {
  emailError: ?string,
  xhrRequest: boolean,
};

class ForgotPassword extends React.PureComponent<Props, State> {
  email: ?string = null;

  inputChangeTimer: ?TimeoutID = null;

  constructor(props: Props, context: void) {
    super(props, context);
    this.unmounted = true;

    this.state = {
      emailError: null,
      xhrRequest: false,
    };

    // binds
    const self: any = this;
    self.onChangeEmailInput = this.onChangeEmailInput.bind(this);
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

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({
      xhrRequest: true,
    });

    axios.post(`${proxyPath}/forgotPassword`, {
      email: this.email,
    }).then(() => {
      this.props.history.push('/find-pwd-tip');
    }).catch((error) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });

      const itemsStack = ItemsStack.get(Enums.GLOB_ITEMS_STACK_NAME);
      const toast = <ToastDanger>{error.response.data}</ToastDanger>;
      itemsStack.add(toast);
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

  emailInput: ?HTMLInputElement;

  unmounted: boolean;

  render() {
    const {
      emailError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      email: inputCN,
    };

    let allInputsChanged = true;

    if (typeof this.email === 'string') {
      if (emailError) {
        errorLabels.email = <InvalidLabel>{emailError}</InvalidLabel>;
        inputCNs.email += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    return (
      <div className="ForgotPassword frm-cntnr">
        <div className="frm">
          <div className="innr animated pulse">
            <div className="ttl">{tt('Password recovery')}</div>
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <div className="form-group">
                <label>
                  {tt('Your')}
                  {' '}
                  {tt('Email')}
                </label>
                <input
                  autoComplete="off"
                  className={inputCNs.email}
                  name="email"
                  type="text"
                  onChange={this.onChangeEmailInput}
                  ref={
                    (el) => {
                      this.emailInput = el;
                    }
                  }
                />
                {errorLabels.email}
              </div>
              <div className="row btns">
                <div className="col-sm-6">
                  <Link
                    className="btn btn-cancel btn-block"
                    to="/login"
                  >
                    {tt('Cancel')}
                  </Link>
                </div>
                <div className="col-sm-6 mt-3 mt-sm-0">
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={disabledSubmit}
                  >
                    {tt('Send')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(ForgotPassword);
