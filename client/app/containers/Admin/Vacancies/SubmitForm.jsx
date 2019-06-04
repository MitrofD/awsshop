// @flow
import React from 'react';
import NumericInput from 'tl-react-numeric-input';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/silver';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/skins/ui/oxide/skin.min.css';
import XHRSpin from '../../includes/XHRSpin';
import { InvalidLabel } from '../../../components/Label';
import { tt } from '../../../components/TranslateElement';
import vacancies from '../../../api/vacancies';

const getUniqueId = (function makeUniqueIdFunc() {
  let idx = 0;

  return () => {
    idx += 1;
    return `page-${idx}`;
  };
}());

type Props = Object & {
  _id?: string,
  onCancel: Function,
  onSuccess: (data: Object) => void,
};

type State = {
  titleError: ?string,
  quantityError: ?string,
  locationError: ?string,
  descriptionError: ?string,
  xhrRequest: boolean,
};

const EMPTY_STR = '';
const DEF_QUANTITY = 1;

class SubmitForm extends React.Component<Props, State> {
  inputChangeTimer: ?TimeoutID = null;

  btnTitle: string;

  defQuantity: number;

  defPosition: string;

  description: string;

  title: string;

  location: string;

  descriptionId: string;

  unmounted = true;

  constructor(props: Props, context: null) {
    super(props, context);
    this.btnTitle = props._id ? 'Save changes' : 'Add vacancy';
    this.descriptionId = `description-txtrea${getUniqueId()}`;

    const getStrPropOrDef = (prop: string) => {
      const retVal = typeof props[prop] === 'string' ? props[prop].trim() : EMPTY_STR;
      return retVal;
    };

    this.description = getStrPropOrDef('description');
    this.title = getStrPropOrDef('title');
    this.location = getStrPropOrDef('location');
    this.defQuantity = parseInt(props.quantity) || DEF_QUANTITY;
    this.defPosition = typeof props.position === 'string' ? props.position.trim() : EMPTY_STR;

    this.state = {
      descriptionError: this.getRequiredErrorWithPropStr('description'),
      quantityError: null,
      titleError: this.getRequiredErrorWithPropStr('title'),
      locationError: this.getRequiredErrorWithPropStr('location'),
      xhrRequest: false,
    };

    const self: any = this;
    self.onChangeTitleInput = this.onChangeTitleInput.bind(this);
    self.onChangeLocationInput = this.onChangeLocationInput.bind(this);
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;

    const onChangeDescription = (editor: Object) => {
      const description = editor.getContent();
      this.description = description.trim();

      this.setStateAfterInputChange({
        descriptionError: this.getRequiredErrorWithPropStr('description'),
      });
    };

    tinymce.init({
      height: 500,
      menu: [],
      plugins: 'textcolor table colorpicker image link lists hr',
      toolbar: 'undo redo | bold italic underline | strikethrough alignleft aligncenter alignright alignjustify alignnone | formatselect forecolor backcolor | bullist numlist | table tabledelete | fontsizeselect | link unlink | hr | image',
      selector: `#${this.descriptionId}`,
      setup: (descriptionEditor) => {
        descriptionEditor.on('keyup', () => {
          onChangeDescription(descriptionEditor);
        });

        descriptionEditor.on('change', () => {
          onChangeDescription(descriptionEditor);
        });
      },
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
    this.stopInputChangeTimer();
  }

  onChangeTitleInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.title = input.value.trim();

    this.setStateAfterInputChange({
      titleError: this.getRequiredErrorWithPropStr('title'),
    });
  }

  onChangeLocationInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.location = input.value.trim();

    this.setStateAfterInputChange({
      locationError: this.getRequiredErrorWithPropStr('location'),
    });
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    this.props.onCancel(event);
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const quantityInput: HTMLInputElement = (form['quantity']: any);
    const positionInput: HTMLInputElement = (form['position']: any);

    const sendData = {
      description: this.description,
      quantity: quantityInput.value,
      location: this.location,
      title: this.title,
      position: positionInput.value,
    };

    const thenClbck = (answer) => {
      if (this.unmounted) {
        return;
      }

      if (typeof answer.errors === 'object' && answer.errors !== null) {
        this.setState(Tools.getErrorsObj(answer.errors));
      } else {
        this.props.onSuccess(answer.data);
      }
    };

    const catchClbck = (error) => {
      NotificationBox.danger(error.message);
    };

    if (this.props._id) {
      vacancies.update(this.props._id, sendData).then(thenClbck).catch(catchClbck);
    } else {
      vacancies.add(sendData).then(thenClbck).catch(catchClbck);
    }
  }

  getRequiredErrorWithPropStr(prop: string): ?string {
    let pureVal = EMPTY_STR;

    if (Tools.has.call(this, prop)) {
      pureVal = (this: Object)[prop];
    }

    let error: ?string = null;

    if (pureVal.length === 0) {
      error = `${Tools.capitalize(prop)} is required`;
    }

    return error;
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
      descriptionError,
      quantityError,
      locationError,
      titleError,
      xhrRequest,
    } = this.state;

    let className = 'SubmitForm';
    let loader = null;

    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      description: inputCN,
      quantity: inputCN,
      location: inputCN,
      title: inputCN,
    };

    if (xhrRequest) {
      loader = <XHRSpin />;
      className += ' ldr-md';
    } else {
      const errorCNPrefix = ' is-invalid';

      if (descriptionError) {
        errorLabels.description = <InvalidLabel>{descriptionError}</InvalidLabel>;
        inputCNs.description += errorCNPrefix;
      }

      if (quantityError) {
        errorLabels.quantity = <InvalidLabel>{quantityError}</InvalidLabel>;
        inputCNs.quantity += errorCNPrefix;
      }

      if (titleError) {
        errorLabels.title = <InvalidLabel>{titleError}</InvalidLabel>;
        inputCNs.title += errorCNPrefix;
      }

      if (locationError) {
        errorLabels.location = <InvalidLabel>{locationError}</InvalidLabel>;
        inputCNs.location += errorCNPrefix;
      }
    }

    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = xhrRequest || errorsCount > 0;

    return (
      <div className={className}>
        {loader}
        <form
          noValidate
          className="row ldr-hddn"
          onSubmit={this.onSubmitForm}
        >
          <div className="col-md-8">
            <div className="form-group">
              <label>
                {tt('Title')}
                :
              </label>
              <input
                autoComplete="title"
                className={inputCNs.title}
                defaultValue={this.title}
                onChange={this.onChangeTitleInput}
                name="title"
                type="text"
              />
              {errorLabels.title}
            </div>
          </div>
          <div className="col-md-4">
            <div className="form-group">
              <label>
                {tt('Quantity')}
                :
              </label>
              <NumericInput
                disabledDecimal
                className={inputCNs.quantity}
                defaultValue={this.defQuantity}
                min={1}
                required
                name="quantity"
              />
              {errorLabels.quantity}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                {tt('Location')}
                :
              </label>
              <input
                autoComplete="location"
                className={inputCNs.location}
                defaultValue={this.location}
                onChange={this.onChangeLocationInput}
                name="location"
                type="text"
              />
              {errorLabels.location}
            </div>
          </div>
          <div className="col-md-6">
            <div className="form-group">
              <label>
                {tt('Position')}
                :
              </label>
              <input
                autoComplete="position"
                className={inputCN}
                defaultValue={this.defPosition}
                name="position"
                type="text"
              />
            </div>
          </div>
          <div className="col-12">
            <div className="form-group">
              <label>
                {tt('Description')}
                :
              </label>
              <textarea
                className={inputCNs.description}
                defaultValue={this.description}
                id={this.descriptionId}
                name="description"
              />
              {errorLabels.description}
            </div>
          </div>
          <div className="col-12 mt-3">
            <div className="btns-grp float-right">
              <button
                className="btn btn-link"
                onClick={this.onClickCancelButton}
                type="button"
              >
                {tt('Cancel')}
              </button>
              <button
                className="btn btn-primary"
                disabled={disabledSubmit}
                type="submit"
              >
                {tt(this.btnTitle)}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default SubmitForm;
