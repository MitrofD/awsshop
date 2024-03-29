// @flow
import React, { Fragment } from 'react';
import NumericInput from 'tl-react-numeric-input';
import XHRSpin from '../includes/XHRSpin';
import { InvalidLabel } from '../../components/Label';
import { tt } from '../../components/TranslateElement';
import serverSettings from '../../api/server-settings';

type Props = {};

type State = {
  disabledSubmit: boolean,
  errors: Object,
  xhrRequest: boolean,
};

class Settings extends React.Component<Props, State> {
  formChangedData = {};

  formCurrData = {};

  formNumData = {};

  formStrData = {};

  inputChangeTimer: ?TimeoutID = null;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      disabledSubmit: false,
      errors: {},
      xhrRequest: true,
    };

    const self: any = this;
    self.onSetNumericInput = this.onSetNumericInput.bind(this);
    self.onChangeInput = this.onChangeInput.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    serverSettings.get().then((settings) => {
      const formNumData = {};
      const formStrData = {};
      const settingKeys = Object.keys(settings);
      const settingKeysLength = settingKeys.length;
      let sI = 0;

      for (; sI < settingKeysLength; sI += 1) {
        const key = settingKeys[sI];
        const value = settings[key];

        if (typeof value === 'number') {
          formNumData[key] = value;
        } else if (typeof value === 'string') {
          formStrData[key] = value;
        }
      }

      this.formNumData = formNumData;
      this.formStrData = formStrData;
      Object.assign(this.formCurrData, settings);
      this.setStateAfterRequest({
        xhrRequest: false,
      });
    }).then().catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopInputChangeTimer();
  }

  onChangeInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pValue = input.value;
    const attrName = input.name;
    const currValue = this.formCurrData[attrName];
    this.formStrData[attrName] = pValue;
    this.formChangedData[attrName] = currValue !== pValue;
    const oldErrors = this.state.errors;
    oldErrors[attrName] = null;

    this.setStateAfterInputChange({
      errors: oldErrors,
    });
  }

  onSetNumericInput(numInput: NumericInput) {
    const numValue = numInput.value;
    const inputName = numInput.name;
    const oldVal = this.formCurrData[inputName];
    this.formNumData[inputName] = numValue;
    this.formChangedData[inputName] = oldVal !== numValue;

    this.setState((prevState) => {
      const newErrors = prevState.errors;
      newErrors[inputName] = null;

      return {
        errors: newErrors,
      };
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    this.setState({
      disabledSubmit: true,
    });

    const setData = Object.assign({}, this.formNumData, this.formStrData);

    serverSettings.set(setData).then((answer) => {
      this.formChangedData = {};
      Object.assign(this.formCurrData, setData);

      let pErrors = {};

      if (typeof answer.errors === 'object' && answer.errors !== null) {
        pErrors = answer.errors;
      }

      this.setStateAfterRequest({
        errors: pErrors,
        disabledSubmit: false,
      });

      const errorsLength = Object.keys(pErrors).length;

      if (errorsLength === 0) {
        NotificationBox.success('Settings has been changed');
      }
    }).catch((error) => {
      NotificationBox.danger(error.message);
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
      if (this.unmounted) {
        return;
      }

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
      disabledSubmit,
      errors,
      xhrRequest,
    } = this.state;

    let content = null;

    if (xhrRequest) {
      content = <XHRSpin />;
    } else {
      const formNumDataKeys = Object.keys(this.formNumData);
      const formStrDataKeys = Object.keys(this.formStrData);
      let pDisabledSubmit = true;

      const getInputDataForKey = (key: string): Object => {
        let inputCN = '';
        let errorNode = null;
        const errorMess = errors[key];

        if (typeof errorMess === 'string') {
          inputCN += 'is-invalid';
          errorNode = <InvalidLabel>{errorMess}</InvalidLabel>;
        }

        return {
          errorNode,
          className: inputCN,
        };
      };

      content = (
        <Fragment>
          <div className="ttl">{tt('Settings')}</div>
          <div className="dt">
            <form
              noValidate
              className="row"
              onSubmit={this.onSubmitForm}
            >
              {formStrDataKeys.map((key) => {
                const inputData = getInputDataForKey(key);

                if (this.formChangedData[key]) {
                  pDisabledSubmit = disabledSubmit;
                }

                const tClassName = `form-control ${inputData.className}`;

                return (
                  <div
                    className="col-md-6"
                    key={key}
                  >
                    <div className="form-group">
                      <label>
                        {tt(key)}
                        :
                      </label>
                      <input
                        className={tClassName}
                        defaultValue={this.formStrData[key]}
                        name={key}
                        onChange={this.onChangeInput}
                        type="text"
                      />
                      {inputData.errorNode}
                    </div>
                  </div>
                );
              })}
              {formNumDataKeys.map((key) => {
                const inputData = getInputDataForKey(key);

                if (this.formChangedData[key]) {
                  pDisabledSubmit = disabledSubmit;
                }

                return (
                  <div
                    className="col-md-6"
                    key={key}
                  >
                    <div className="form-group">
                      <label>
                        {tt(key)}
                        :
                      </label>
                      <NumericInput
                        className={inputData.className}
                        defaultValue={this.formNumData[key]}
                        min="0"
                        name={key}
                        onSet={this.onSetNumericInput}
                      />
                      {inputData.errorNode}
                    </div>
                  </div>
                );
              })}
              <div className="col-12">
                <button
                  className="btn btn-primary float-right"
                  disabled={pDisabledSubmit}
                  type="submit"
                >
                  {tt('Save changes')}
                </button>
              </div>
            </form>
          </div>
        </Fragment>
      );
    }

    return (
      <div className="Settings">
        {content}
      </div>
    );
  }
}

export default Settings;
