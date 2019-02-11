// @flow
import React from 'react';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import user from '../../../api/user';

type Props = {};

type State = {
  pMWalletError: ?string,
  xhrRequest: boolean,
};

const isChangedVal = (val: any) => val !== null;

class PerfectMoney extends React.Component<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      pMWalletError: null,
      xhrRequest: false,
    };

    const currUser = user.get();
    this.currPWWallet = currUser ? currUser.pMWallet : '';

    const self: any = this;
    self.onChangePMWalletInput = this.onChangePMWalletInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onChangePMWalletInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'USD wallet is required';
    } else if (!Tools.perfMoneyUSDWalletRegExp.test(pureVal)) {
      error = 'USD wallet is incorrect';
    }

    this.wallet = pureVal;
    this.setStateAfterInputChange({
      pMWalletError: error,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    this.setState({
      xhrRequest: true,
    });

    user.update({
      pMWallet: this.wallet,
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
        NotificationBox.success('USD wallet has been changed');
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

  wallet: ?string = null;
  currPWWallet: string;
  inputChangeTimer: ?TimeoutID = null;
  unmounted = true;

  render() {
    const {
      pMWalletError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      wallet: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedVal(this.wallet)) {
      if (pMWalletError) {
        errorLabels.wallet = <InvalidLabel>{pMWalletError}</InvalidLabel>;
        inputCNs.wallet += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    return (
      <div className="PerfectMoney">
        <div className="ttl">{tt('Set "Perfect money" wallet')}</div>
        <div className="dt row">
          <form
            className="col-sm-12 col-md-6"
            noValidate
            onSubmit={this.onSubmitForm}
          >
            <div className="form-group">
              <label>USD {tt('wallet')} (Ex: U12345678)</label>
              <input
                autoComplete="new-password"
                className={inputCNs.wallet}
                defaultValue={this.currPWWallet}
                onChange={this.onChangePMWalletInput}
                type="text"
              />
              {errorLabels.wallet}
            </div>
            <button
              className="btn btn-primary"
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

export default PerfectMoney;
