// @flow
import React from 'react';
import tinymce from 'tinymce/tinymce';
import 'tinymce/themes/modern';
import 'tinymce/plugins/colorpicker';
import 'tinymce/plugins/textcolor';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/skins/lightgray/skin.min.css';
import { InvalidLabel } from '../../../../components/Label';
import { tt } from '../../../../components/TranslateElement';
// import products from '../../../api/products';

type Props = Object;

type State = {
  currTab: string,
  ethPriceError: ?string,
  descriptionError: ?string,
  titleError: ?string,
  shippingError: ?string,
};

const DEF_NUM = 0;
const DEF_STR = '';

class EditProduct extends React.PureComponent<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    const getStrPropOrDef = (prop: string) => {
      const retVal = typeof props[prop] === 'string' ? props[prop].trim() : DEF_STR;
      return retVal;
    };

    this.ethPrice = parseFloat(props.ethPrice) || DEF_NUM;

    const descriptionProp = 'description';
    const titleProp = 'title';
    const shippingProp = 'shipping';

    this.description = getStrPropOrDef(descriptionProp);
    this.title = getStrPropOrDef(titleProp);
    this.shipping = getStrPropOrDef(shippingProp);

    this.state = {
      currTab: this.getFirstTab(),
      ethPriceError: null,
      descriptionError: this.getRequiredErrorWithProp(descriptionProp),
      titleError: this.getRequiredErrorWithProp(titleProp),
      shippingError: this.getRequiredErrorWithProp(shippingProp),
    };

    const self: any = this;
    self.onChangeTitleInput = this.onChangeTitleInput.bind(this);
    self.onClickTabItem = this.onClickTabItem.bind(this);
    self.onSubmitForm = this.onSubmitForm.bind(this);
  }

  componentDidMount() {
    this.unmounted = false;
    const settings = {
      height: 500,
      menu: [],
      plugins: 'textcolor colorpicker image link lists hr',
      toolbar: 'bold italic underline | strikethrough alignleft aligncenter alignright alignjustify alignnone | forecolor backcolor | bullist numlist | fontsizeselect | link unlink | hr | image',
    };

    tinymce.init({
      ...settings,
      selector: '.tabs textarea',
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onChangeTitleInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.title = input.value.trim();

    this.setStateAfterInputChange({
      titleError: this.getRequiredErrorWithProp('title'),
    });
  }

  onClickTabItem(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    const { tab } = event.currentTarget.dataset;

    if (!Tools.has.call(this.tabs, tab)) {
      throw new Error(`Tab "${tab}" not available`);
    }

    this.setState({
      currTab: tab,
    });
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    console.log(typeof this);
  }

  getFirstTab() {
    const allTabs = Object.keys(this.tabs);
    return allTabs[0];
  }

  getRequiredErrorWithProp(prop: string): ?string {
    let pureVal = DEF_STR;

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

  ethPrice: number;
  description: string;
  inputChangeTimer: ?TimeoutID = null;
  tabs = {
    desc: 'description',
    shppng: 'shipping',
  };
  title: string;
  shipping: string;
  unmounted = true;

  render() {
    const {
      currTab,
      ethPriceError,
      descriptionError,
      titleError,
      shippingError,
    } = this.state;

    const errorCNPrefix = ' is-invalid';
    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      ethPrice: inputCN,
      description: inputCN,
      title: inputCN,
      shipping: inputCN,
    };

    if (ethPriceError) {
      errorLabels.ethPrice = <InvalidLabel>{ethPriceError}</InvalidLabel>;
      inputCNs.ethPrice += errorCNPrefix;
    }

    if (descriptionError) {
      errorLabels.description = <InvalidLabel>{descriptionError}</InvalidLabel>;
      inputCNs.description += errorCNPrefix;
    }

    if (titleError) {
      errorLabels.title = <InvalidLabel>{titleError}</InvalidLabel>;
      inputCNs.title += errorCNPrefix;
    }

    if (shippingError) {
      errorLabels.shipping = <InvalidLabel>{shippingError}</InvalidLabel>;
      inputCNs.shipping += errorCNPrefix;
    }

    const tabKeys = Object.keys(this.tabs);

    return (
      <div className="EditProduct">
        <form
          noValidate
          onSubmit={this.onSubmitForm}
        >
          <div className="form-group">
            <label>{tt('Title')}</label>
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
          <div className="row">
            <div className="col-sm-6 form-group">
              <label>{tt('Category')}</label>
            </div>
          </div>
          <div className="tabs">
            <ul className="nav nav-tabs">
              {tabKeys.map((tabKey) => {
                const tabTitle = this.tabs[tabKey];
                let tabItemCN = 'nav-link';

                if (currTab === tabKey) {
                  tabItemCN += ' active';
                }

                return (
                  <li
                    className="nav-item"
                    key={tabKey}
                  >
                    <a
                      className={tabItemCN}
                      data-tab={tabKey}
                      onClick={this.onClickTabItem}
                      href="#!"
                    >
                      {tabTitle}
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className={`tab-content ${currTab}`}>
              <div className="form-group desc">
                <textarea
                  className={inputCNs.description}
                  defaultValue={this.description}
                  name="description"
                />
                {errorLabels.description}
              </div>
              <div className="form-group shppng">
                <textarea
                  className={inputCNs.shipping}
                  defaultValue={this.shipping}
                  name="shipping"
                />
                {errorLabels.shipping}
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

export default EditProduct;
