// @flow
import React from 'react';
import Modal from '../../../components/Modal';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import categories from '../../../api/categories';

type Props = {
  item?: ?Object,
  onApply: (Object) => void,
};

type State = {
  nameError: ?string,
  xhrRequest: boolean,
};

const defaultProps = {
  item: null,
};

class AddEditCategory extends React.Component<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: null) {
    super(props, context);

    if (props.item) {
      this.editItem = props.item;
      this.buttonTitle = 'Save';
      this.isEditMode = true;
      this.name = this.editItem.name;
    }

    this.state = {
      nameError: null,
      xhrRequest: false,
    };

    const self: any = this;
    self.onClickApplyButton = this.onClickApplyButton.bind(this);
    self.onChangeNameInput = this.onChangeNameInput.bind(this);
    self.setFirstInput = this.setFirstInput.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    if (this.firstInput) {
      this.firstInput.focus();
    }
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onClickApplyButton() {
    const pureName = this.name || '';

    this.setState({
      xhrRequest: true,
    });

    const onCatch = (error) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        xhrRequest: false,
      });

      NotificationBox.danger(error.message);
    };

    const newData = {
      name: pureName,
    };

    if (this.isEditMode) {
      categories.update(this.editItem._id, newData).then(this.props.onApply).catch(onCatch);
    } else {
      categories.add(newData).then(this.props.onApply).catch(onCatch);
    }
  }

  onChangeNameInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const pureVal = input.value.trim();
    let error: ?string = null;

    if (pureVal.length === 0) {
      error = 'Name is required';
    }

    this.name = pureVal;
    this.setStateAfterInputChange({
      nameError: error,
    });
  }

  setFirstInput(el: ?HTMLInputElement) {
    this.firstInput = el;
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

  buttonTitle = '+ Add';
  editItem = {};
  firstInput: ?HTMLInputElement = null;
  inputChangeTimer: ?TimeoutID = null;
  isEditMode = false;
  name: ?string = null;
  unmounted = true;

  render() {
    const {
      nameError,
      xhrRequest,
    } = this.state;

    let btnDisabled = xhrRequest;
    const errorCNPrefix = ' is-invalid';
    let errorLabel = null;
    let inputCN = 'form-control';

    if (typeof this.name === 'string') {
      if (nameError) {
        errorLabel = <InvalidLabel>{nameError}</InvalidLabel>;
        inputCN += errorCNPrefix;
        btnDisabled = true;
      }
    } else {
      btnDisabled = true;
    }

    const footer = (
      <button
        className="btn btn-primary btn-sm"
        disabled={btnDisabled}
        onClick={this.onClickApplyButton}
      >
        {tt(this.buttonTitle)}
      </button>
    );

    return (
      <Modal
        {...this.props}
        closeButtonText="Cancel"
        footer={footer}
      >
        <div className="form-group">
          <label>
            {tt('Category name:')}
          </label>
          <input
            className={inputCN}
            defaultValue={this.editItem.name}
            onChange={this.onChangeNameInput}
            type="text"
            ref={this.setFirstInput}
          />
          {errorLabel}
        </div>
      </Modal>
    );
  }
}

export default AddEditCategory;
