// @flow
import React from 'react';
import axios from 'axios';
import AlertDanger from '../../components/AlertDanger';
import AlertSuccess from '../../components/AlertSuccess';
import { TTInput } from '../../components/TranslateElement';

type Props = {};

type State = {
  alert: React$Node,
};

class Password extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      alert: null,
    };

    const self: any = this;
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const button: HTMLButtonElement = (form['submit-btn']: any);
    const newPasswordInput: HTMLInputElement = (form['new-password']: any);
    const passwordInput: HTMLInputElement = (form['curr-password']: any);

    const sendData = {
      newPassword: newPasswordInput.value,
      password: passwordInput.value,
    };

    button.disabled = true;

    this.setState({
      alert: null,
    });

    const finishWithAlert = (alert: React$Node) => {
      if (this.unmounted) {
        return;
      }

      button.disabled = false;
      this.setState({
        alert,
      });
    };

    axios.post('/call/setPassword', sendData).then(() => {
      const alertSuccess = <AlertSuccess>Password has been changed<AlertSuccess>;
      finishWithAlert(alertSuccess);
      form.reset();
    }).catch((error) => {
      const alertDanger = <AlertDanger>{error.response.data}</AlertDanger>;
      finishWithAlert(alertDanger);
    });
  }

  unmounted = true;

  render() {
    return (
      <div className="Password mt-3">
        <div className="page-title">Modify login password</div>
        <div className="mt-3 row justify-content-md-center">
          <div className="text-center col-md-6">
            {this.state.alert}
            <form
              noValidate
              onSubmit={this.onSubmitForm}
            >
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <td className="text-right">Old password:</td>
                    <td>
                      <TTInput
                        autoComplete="new-password"
                        className="form-control form-control-sm"
                        name="curr-password"
                        type="password"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="text-right">New password:</td>
                    <td>
                      <TTInput
                        autoComplete="new-password"
                        className="form-control form-control-sm"
                        name="new-password"
                        type="password"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
              <button
                type="submit"
                name="submit-btn"
                className="btn btn-success"
              >
                Change password
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default asHOT(module)(Password);
