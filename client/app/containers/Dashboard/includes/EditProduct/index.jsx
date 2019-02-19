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
import CategorySelect from './CategorySelect';
import XHRSpin from '../../../includes/XHRSpin';
import NumberInput from '../../../../components/NumberInput';
import { InvalidLabel } from '../../../../components/Label';
import { tt } from '../../../../components/TranslateElement';
import serverSettings from '../../../../api/server-settings';
import products from '../../../../api/products';

const getUniqueId = (function makeUniqueIdFunc() {
  let idx = 0;

  return () => {
    idx += 1;
    return `edt-prdct${idx}`;
  };
}());

type Props = Object & {
  goToBack: Function,
  onSave: (data: Object) => void,
};

type State = {
  categoryError: ?string,
  currTab: string,
  descriptionError: ?string,
  images: string[],
  titleError: ?string,
  priceError: ?string,
  shippingError: ?string,
  submitMode: boolean;
  xhrRequest: boolean;
};

const EMPTY_NUM = 0;
const EMPTY_STR = '';

class EditProduct extends React.Component<Props, State> {
  constructor(props: Props, context: null) {
    super(props, context);
    this.btnTitle = 'Save changes';
    this.isRaw = false;

    const uniqueId = getUniqueId();

    this.uniqueIDs = {
      desc: `desc-txtrea${uniqueId}`,
      shppng: `shppng-txtrea${uniqueId}`,
    };

    if (props.isRaw) {
      this.isRaw = true;
      this.btnTitle = 'Push to shop';
    }

    const getStrPropOrDef = (prop: string) => {
      const retVal = typeof props[prop] === 'string' ? props[prop].trim() : EMPTY_STR;
      return retVal;
    };

    this.price = parseFloat(props.price) || EMPTY_NUM;
    this.category = getStrPropOrDef('categoryId');
    this.description = getStrPropOrDef('description');
    this.title = getStrPropOrDef('title');
    this.shipping = getStrPropOrDef('shipping');

    const images = Tools.isArray(props.images) ? props.images : [];

    this.state = {
      images,
      categoryError: this.getRequiredErrorWithPropStr('category'),
      currTab: this.getFirstTab(),
      descriptionError: this.getRequiredErrorWithPropStr('description'),
      titleError: this.getRequiredErrorWithPropStr('title'),
      priceError: this.getRequiredErrorWithPropNum('price'),
      shippingError: this.getRequiredErrorWithPropStr('shipping'),
      submitMode: false,
      xhrRequest: true,
    };

    const origPrice = this.isRaw ? this.price : this.origPrice;
    this.origPrice = parseFloat(origPrice) || 0;

    const self: any = this;
    self.onChangePriceInput = this.onChangePriceInput.bind(this);
    self.onChangeTitleInput = this.onChangeTitleInput.bind(this);
    self.onChangeCategorySelect = this.onChangeCategorySelect.bind(this);
    self.onClickCancelButton = this.onClickCancelButton.bind(this);
    self.onClickTabItem = this.onClickTabItem.bind(this);
    self.onClickThumb = this.onClickThumb.bind(this);
    self.onSetPriceInput = this.onSetPriceInput.bind(this);
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

    const onChangeDescContent = (editor: Object) => {
      const content = editor.getContent();
      this.description = content.trim();

      this.setStateAfterInputChange({
        descriptionError: this.getRequiredErrorWithPropStr('description'),
      });
    };

    tinymce.init({
      ...settings,
      selector: `#${this.uniqueIDs.desc}`,
      setup: (descEditor) => {
        descEditor.on('keyup', () => {
          onChangeDescContent(descEditor);
        });

        descEditor.on('change', () => {
          onChangeDescContent(descEditor);
        });
      },
    });

    const onChangeShippingContent = (editor: Object) => {
      const content = editor.getContent();
      this.shipping = content.trim();

      this.setStateAfterInputChange({
        shippingError: this.getRequiredErrorWithPropStr('shipping'),
      });
    };

    tinymce.init({
      ...settings,
      selector: `#${this.uniqueIDs.shppng}`,
      setup: (descEditor) => {
        descEditor.on('keyup', () => {
          onChangeShippingContent(descEditor);
        });

        descEditor.on('change', () => {
          onChangeShippingContent(descEditor);
        });
      },
    });

    const defVal = 0;

    const makeGetEarnings = (purchPrice: any, purchPricePerc: any) => {
      const pPurchPrice = parseFloat(purchPrice) || defVal;
      const pPurchPricePerc = parseFloat(purchPricePerc) || defVal;

      this.getEarnings = () => {
        let earnings = (this.price / 100) * pPurchPricePerc;

        if (earnings > pPurchPrice) {
          earnings = pPurchPrice;
        }

        return NumberFormat(earnings);
      };

      this.earningsPrice = this.getEarnings();

      this.setState({
        xhrRequest: false,
      });
    };

    serverSettings.get().then((sSettings) => {
      makeGetEarnings(sSettings.PURCHASE_PRICE, sSettings.PURCHASE_PRICE_PERC);
    }).catch(() => {
      makeGetEarnings(defVal, defVal);
    });
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  onChangePriceInput(event: Event, price: ?number) {
    this.price = price || EMPTY_NUM;
    this.earningsPrice = this.getEarnings();

    this.setStateAfterInputChange({
      priceError: this.getRequiredErrorWithPropNum('price'),
    });
  }

  onChangeTitleInput(event: SyntheticEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    this.title = input.value.trim();

    this.setStateAfterInputChange({
      titleError: this.getRequiredErrorWithPropStr('title'),
    });
  }

  onChangeCategorySelect(categoryId: ?string) {
    this.category = categoryId || EMPTY_STR;

    this.setState({
      categoryError: this.getRequiredErrorWithPropStr('category'),
    });
  }

  onClickCancelButton(event: SyntheticEvent<HTMLElement>) {
    this.props.goToBack(event);
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

  onClickThumb(event: SyntheticEvent<HTMLElement>) {
    const { idx } = event.currentTarget.dataset;
    const pureIdx = parseInt(idx) || EMPTY_NUM;
    const thumbImages = this.state.images;
    thumbImages.splice(pureIdx, 1);

    this.setState({
      images: thumbImages,
    });
  }

  onSetPriceInput(el: ?NumberInput) {
    if (el) {
      this.priceInputRef = el;
    }
  }

  onSubmitForm(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    const methodName = this.isRaw ? 'push' : 'update';

    const sendData = {
      categoryId: this.category,
      description: this.description,
      images: this.state.images,
      title: this.title,
      price: this.price,
      shipping: this.shipping,
    };

    products[methodName](this.props._id, sendData).then((product) => {
      this.props.onSave(product);
    }).catch((error) => {
      NotificationBox.danger(error.message);
    });
  }

  getFirstTab() {
    const allTabs = Object.keys(this.tabs);
    return allTabs[0];
  }

  getRequiredErrorWithPropNum(prop: string): ?string {
    let pureVal = EMPTY_NUM;

    if (Tools.has.call(this, prop)) {
      pureVal = (this: Object)[prop];
    }

    let error: ?string = null;

    if (pureVal === EMPTY_NUM) {
      error = `${Tools.capitalize(prop)} is required`;
    }

    return error;
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

  getEarnings: Function = () => null;

  stopInputChangeTimer() {
    if (this.inputChangeTimer) {
      clearTimeout(this.inputChangeTimer);
    }

    this.inputChangeTimer = null;
  }

  btnTitle: string;
  category: ?string;
  description: string;
  earningsPrice: ?string = null;
  inputChangeTimer: ?TimeoutID = null;
  isRaw: boolean;
  tabs = {
    desc: 'description',
    shppng: 'shipping',
  };
  title: string;
  price: number;
  priceInputRef: NumberInput;
  origPrice: number;
  shipping: string;
  uniqueIDs: { [string]: string } = {};
  unmounted = true;

  render() {
    const {
      categoryError,
      currTab,
      descriptionError,
      images,
      titleError,
      priceError,
      shippingError,
      submitMode,
      xhrRequest,
    } = this.state;

    let className = 'EditProduct';
    let loader = null;

    const errorLabels = {};
    const inputCN = 'form-control';

    const inputCNs = {
      category: inputCN,
      description: inputCN,
      title: inputCN,
      price: inputCN,
      shipping: inputCN,
    };

    if (xhrRequest) {
      loader = <XHRSpin />;
      className += ' ldr-md';
    } else {
      const errorCNPrefix = ' is-invalid';

      if (categoryError) {
        errorLabels.category = <InvalidLabel>{categoryError}</InvalidLabel>;
        inputCNs.category += errorCNPrefix;
      }

      if (descriptionError) {
        errorLabels.description = <InvalidLabel>{descriptionError}</InvalidLabel>;
        inputCNs.description += errorCNPrefix;
      }

      if (titleError) {
        errorLabels.title = <InvalidLabel>{titleError}</InvalidLabel>;
        inputCNs.title += errorCNPrefix;
      }

      if (priceError) {
        errorLabels.price = <InvalidLabel>{priceError}</InvalidLabel>;
        inputCNs.price += errorCNPrefix;
      }

      if (shippingError) {
        errorLabels.shipping = <InvalidLabel>{shippingError}</InvalidLabel>;
        inputCNs.shipping += errorCNPrefix;
      }
    }

    const tabKeys = Object.keys(this.tabs);
    const errorsCount = Object.keys(errorLabels).length;
    const disabledSubmit = submitMode || xhrRequest || errorsCount > 0;

    return (
      <div className={className}>
        {loader}
        <form
          noValidate
          className="ldr-hddn"
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
          <div className="row form-group">
            <div className="col-sm-4">
              <img
                alt="main_img"
                className="img-thumbnail"
                src={this.props.image}
              />
            </div>
            <div className="col-sm-8">
              {images.length > 0 && (
                <div className="row thmbs">
                  {images.map((image, idx) => {
                    const key = `thmb${idx}`;

                    return (
                      <div
                        className="col-sm-3"
                        key={key}
                      >
                        <div
                          className="thmb"
                          style={{ backgroundImage: `url(${image})` }}
                        >
                          <button
                            className="cls"
                            data-idx={idx}
                            onClick={this.onClickThumb}
                            type="button"
                          >
                            {tt('Delete')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {this.props.url && (
                <div className="attr-inf">
                  <strong>Product link:</strong> <a href={this.props.url}>{this.props.url}</a>
                </div>
              )}
              {this.origPrice > 0 && (
                <div className="attr-inf">
                  <strong>Original price:</strong> {this.origPrice} $
                </div>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>{tt('Category')}</label>
                <CategorySelect
                  className={inputCNs.category}
                  id={this.category}
                  onChange={this.onChangeCategorySelect}
                />
                {errorLabels.category}
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>{tt('Price')} ({tt('earnings')}: {this.earningsPrice} $)</label>
                <NumberInput
                  className={inputCNs.price}
                  defaultValue={this.price}
                  min={0}
                  onChange={this.onChangePriceInput}
                  ref={this.onSetPriceInput}
                />
                {errorLabels.price}
              </div>
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
                  id={this.uniqueIDs.desc}
                  name="description"
                />
                {errorLabels.description}
              </div>
              <div className="form-group shppng">
                <textarea
                  className={inputCNs.shipping}
                  defaultValue={this.shipping}
                  id={this.uniqueIDs.shppng}
                  name="shipping"
                />
                {errorLabels.shipping}
              </div>
            </div>
          </div>
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
        </form>
      </div>
    );
  }
}

export default EditProduct;
