// @flow
import React from 'react';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import user from '../../../api/user';

type Props = {};

type State = {
  ethAddressError: ?string,
  xhrRequest: boolean,
};

const isChangedVal = (val: any) => val !== null;

class ETHAddress extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      ethAddressError: null,
      xhrRequest: false,
    };

    const currUser = user.get();
    this.currAddress = currUser ? currUser.ethAddress : '';

    const self: any = this;
    self.onChangeAddressInput = this.onChangeAddressInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
  }

  componentWillUnmount() {
    this.stopInputChangeTimer();
    this.unmounted = true;
  }

  onChangeAddressInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'ETH address is required';
    } else if (!Tools.ethAdressRegExp.test(pureVal)) {
      error = 'ETH address is incorrect';
    }

    this.address = pureVal;
    this.setStateAfterInputChange({
      ethAddressError: error,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    this.setState({
      xhrRequest: true,
    });

    user.update({
      ethAddress: this.address,
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
        NotificationBox.success('ETH address has been changed');
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

  address: ?string = null;
  currAddress: string;
  inputChangeTimer: ?TimeoutID = null;
  unmounted = true;

  render() {
    const {
      ethAddressError,
      xhrRequest,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      address: inputCN,
    };

    let allInputsChanged = true;

    if (isChangedVal(this.address)) {
      if (ethAddressError) {
        errorLabels.address = <InvalidLabel>{ethAddressError}</InvalidLabel>;
        inputCNs.address += errorCNPrefix;
      }
    } else {
      allInputsChanged = false;
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || !allInputsChanged || errorsCount > 0;

    return (
      <div className="ETHAddress">
        <div className="ttl">{tt('Change ETH address')}</div>
        <div className="dt row">
          <form
            className="col-sm-12 col-md-6"
            noValidate
            onSubmit={this.onSubmitForm}
          >
            <div className="form-group">
              <label>{tt('Public address')}</label>
              <input
                autoComplete="new-password"
                className={inputCNs.address}
                defaultValue={this.currAddress}
                onChange={this.onChangeAddressInput}
                type="text"
              />
              {errorLabels.address}
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

export default ETHAddress;
