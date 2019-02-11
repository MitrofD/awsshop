// @flow
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import FixedOverlay from './FixedOverlay';

const DropdownDivider = () => <div className="dropdown-divider" />;
const dropdownItemName = 'DropdownItem';
DropdownDivider.displayName = dropdownItemName;

type ItemProps = {
  children: React$Node,
  className?: ?string,
  data?: any,
  onClick?: Function,
  wrapped?: boolean,
};

const itemDefaultProps = {
  className: null,
  data: null,
  onClick: null,
  wrapped: false,
};

const DropdownItem = (props: ItemProps) => {
  const {
    className,
    children,
    data,
    onClick,
  } = props;

  const itemsProps = {};
  itemsProps.className = `${dropdownItemName} dropdown-item`;

  if (className) {
    itemsProps.className += ` ${className}`;
  }

  if (onClick) {
    itemsProps.onClick = (event) => {
      onClick(data, event);
    };
  }

  return (
    <div {...itemsProps} >
      {children}
    </div>
  );
};

DropdownItem.defaultProps = itemDefaultProps;
DropdownItem.displayName = dropdownItemName;

const ALL_DROPDOWNS = {};

const dropdownUniqueName = (function genDDUniqNameFunc() {
  let idx = 0;
  return (): string => {
    idx += 1;
    return `drpdwn_${idx}`;
  };
}());

type Props = {
  children: React.DOM,
  className?: ?string,
  onLeave?: Function,
  topSticky?: boolean,
  rightSticky?: boolean,
  bottomSticky?: boolean,
  leftSticky?: boolean,
  isFullWidth?: boolean,
};

const defaultProps = {
  className: null,
  onLeave: null,
  topSticky: false,
  rightSticky: false,
  bottomSticky: false,
  leftSticky: false,
  isFullWidth: false,
};

function boolAsStr(val: any): string {
  return val ? 't' : 'f';
}

function applyStickySides() {
  const {
    topSticky,
    bottomSticky,
    isFullWidth,
  } = this.props;

  let {
    rightSticky,
    leftSticky,
  } = this.props;

  if (isFullWidth) {
    rightSticky = true;
    leftSticky = true;
  }

  const newUStickyName = boolAsStr(topSticky) + boolAsStr(rightSticky) + boolAsStr(bottomSticky) + boolAsStr(leftSticky);

  if (this.uStikyName !== newUStickyName) {
    const stickyStyle = '0';
    const styleObj = {};

    const checkProps = [
      'top',
      'right',
      'bottom',
      'left',
    ];

    checkProps.forEach((prop) => {
      const val = eval(`${prop}Sticky`);

      if (val) {
        styleObj[prop] = stickyStyle;
      }
    });

    this.myNode.style.top = styleObj.top;
    this.myNode.style.right = styleObj.right;
    this.myNode.style.bottom = styleObj.bottom;
    this.myNode.style.left = styleObj.left;

    if (!rightSticky || !leftSticky) {
      const oldOpacity = this.myNode.style.opacity;
      this.myNode.style.opacity = '0';
      this.myNode.style.position = 'fixed';
      const myWidth = this.myNode.offsetWidth;
      const parentWidth = this.parentNode.offsetWidth;
      this.myNode.style.width = parentWidth > myWidth ? '100%' : `${myWidth}px`;
      this.myNode.style.opacity = oldOpacity;
      this.myNode.style.position = 'absolute';
    }

    this.uStikyName = newUStickyName;
  }
}

class Dropdown extends React.Component<Props> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: void) {
    super(props, context);

    this.name = dropdownUniqueName();
    ALL_DROPDOWNS[this.name] = this;

    // binds...
    const self: any = this;
    self.onClickToFixedOverlay = this.onClickToFixedOverlay.bind(this);
  }

  componentDidMount() {
    const myNode = ReactDOM.findDOMNode(this); // eslint-disable-line react/no-find-dom-node

    if (myNode instanceof HTMLElement) {
      this.myNode = myNode;

      if (myNode.parentNode instanceof HTMLElement) {
        this.parentNode = myNode.parentNode;
        this.defaultParentClass = this.parentNode.className;
        let newParentNodeClass = 'dropdown-wrapper';

        if (this.defaultParentClass) {
          newParentNodeClass += ` ${this.defaultParentClass}`;
        }

        this.parentNode.className = newParentNodeClass;
      }

      applyStickySides.call(this);
    }
  }

  componentWillUpdate() {
    applyStickySides.call(this);
  }

  componentWillUnmount() {
    delete ALL_DROPDOWNS[this.name];

    if (this.defaultParentClass) {
      this.parentNode.className = this.defaultParentClass;
    } else {
      this.parentNode.removeAttribute('class');
    }

    delete this.myNode;
    delete this.parentNode;
  }

  onClickToFixedOverlay(event: SyntheticEvent<HTMLElement>) {
    event.stopPropagation();

    if (this.props.onLeave) {
      this.props.onLeave(event);
    }
  }

  defaultParentClass: ?string;
  name: string;
  myNode: HTMLElement;
  parentNode: HTMLElement;
  uStikyName: string;

  render() {
    const {
      className,
      children,
    } = this.props;

    const boxProps = {
      className: 'dropdown-menu',
    };

    if (className) {
      boxProps.className += ` ${className}`;
    }

    const itemsArray = [];

    React.Children.toArray(children).forEach((item) => {
      if (item.type.displayName === dropdownItemName) {
        itemsArray.push(item);
      }
    });

    return (
      <Fragment>
        <div {...boxProps} >
          {itemsArray}
        </div>
        <FixedOverlay
          onClick={this.onClickToFixedOverlay}
          className="of-dropdown"
        />
      </Fragment>
    );
  }
}

export {
  DropdownDivider,
  DropdownItem,
};

export default Dropdown;
