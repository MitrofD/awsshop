// @flow
import React from 'react';
import FixedOverlay from './FixedOverlay';

const SIZE = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
};

const sizeForClassName = {
  [SIZE.SMALL]: 'sm',
  [SIZE.MEDIUM]: 'md',
  [SIZE.LARGE]: 'lg',
};

const getDefName = (function genDefName() {
  let idx = 0;
  return () => {
    idx += 1;
    return `mdl-${idx}`;
  };
}());

type Props = {
  children?: React.DOM,
  className?: ?string,
  closeButtonText?: string,
  disableClose?: boolean,
  closeButtonHidden?: boolean,
  footer?: React$Node,
  isOpened?: boolean,
  isFixedFooter?: boolean,
  name?: string,
  onOpen?: ?Function,
  onClose?: ?Function,
  title?: React.DOM,
  size?: $Values<typeof SIZE>,
};

type State = {
  isShown: boolean,
};

const defaultProps = {
  children: null,
  className: null,
  closeButtonText: 'Close',
  disableClose: false,
  closeButtonHidden: false,
  footer: null,
  isOpened: false,
  isFixedFooter: false,
  name: getDefName(),
  onOpen: null,
  onClose: null,
  title: null,
  size: SIZE.MEDIUM,
};

class Modal extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  static close = (name: string) => {
    Modal.setVisible(name, false);
  };

  static open = (name: string) => {
    Modal.setVisible(name, true);
  };

  static allItems: { [string]: Modal } = {};

  constructor(props: Props, context: any) {
    super(props, context);

    this.state = {
      isShown: !!props.isOpened,
    };

    const self: any = this;
    const pureName = typeof props.name === 'string' ? props.name.trim() : '';
    self.name = pureName.length > 1 ? pureName : getDefName();
    self.onClickSelf = this.onClickSelf.bind(this);
    self.onClickToCloseElement = this.onClickToCloseElement.bind(this);
  }

  componentDidMount() {
    const self: any = this;
    Modal.allItems[this.name] = self;
  }

  componentWillUnmount() {
    delete Modal.allItems[this.name];
  }

  onClickToCloseElement(event: SyntheticEvent<HTMLElement>) {
    event.stopPropagation();

    if (this.props.disableClose) {
      return;
    }

    this.close();
  }

  onClickSelf(event: SyntheticEvent<HTMLElement>) { // eslint-disable-line class-methods-use-this
    event.stopPropagation();
  }

  get title() {
    if (this.props.title) {
      return (
        <div className="modal-header">
          <h5 className="modal-title">{this.props.title}</h5>
          <button
            type="button"
            className="close"
            onClick={this.onClickToCloseElement}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      );
    }

    return null;
  }

  get footer() {
    const {
      footer,
      closeButtonText,
      closeButtonHidden,
      disableClose,
    } = this.props;

    const footerComponents = footer ? React.Children.toArray(footer) : [];

    if (!disableClose && !closeButtonHidden) {
      const closeButton = (
        <button
          key={-1}
          type="button"
          className="btn btn-link btn-sm"
          onClick={this.onClickToCloseElement}
        >
          {closeButtonText}
        </button>
      );

      footerComponents.splice(0, 0, closeButton);
    }

    if (footerComponents.length > 0) {
      return (
        <div className="modal-footer">
          {footerComponents}
        </div>
      );
    }

    return null;
  }

  static setVisible = (name: string, visibled: boolean) => {
    const modalKeys = Object.keys(Modal.allItems);
    modalKeys.forEach((key) => {
      const modal = Modal.allItems[key];
      modal.close();
    });

    const modal = Modal.allItems[name];

    if (modal && visibled) {
      modal.open();
    }
  };

  close() {
    this.setState({
      isShown: false,
    });

    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  open() {
    this.setState({
      isShown: true,
    });

    if (this.props.onOpen) {
      this.props.onOpen();
    }
  }

  toggle() {
    if (this.state.isShown) {
      this.close();
    } else {
      this.open();
    }
  }

  name: string;

  render() {
    let content = null;

    if (this.state.isShown) {
      const {
        className,
        size,
        children,
        isFixedFooter,
      } = this.props;

      const rSize = size || defaultProps.size;
      const sizeClass = `modal-${sizeForClassName[rSize]}`;
      let rClassName = 'Modal modal';

      if (className) {
        rClassName += ` ${className}`;
      }

      let innerModalClassName = `modal-dialog modal-dialog-centered ${sizeClass}`;

      if (isFixedFooter) {
        innerModalClassName += ' modal-fixed-footer';
      }

      content = (
        <FixedOverlay
          className={rClassName}
          onClick={this.onClickToCloseElement}
        >
          <div
            role="presentation"
            className={innerModalClassName}
            onClick={this.onClickSelf}
          >
            <div className="modal-content">
              {this.title}
              <div className="modal-body">
                {children}
              </div>
              {this.footer}
            </div>
          </div>
        </FixedOverlay>
      );
    }

    return content;
  }
}

export { SIZE };
export default Modal;
