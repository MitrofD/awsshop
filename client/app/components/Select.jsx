// @flow
import React from 'react';
import Dropdown, { DropdownItem } from './Dropdown';

const itemDisplayName = 'Option';

const Option = () => null;

Option.displayName = itemDisplayName;

type Props = {
  className: ?string,
  children: React.DOM,
  name: ?string,
  value: ?string,
  disabled: boolean,
  onChange: ?Function,
  placeholder: ?string,
};

type State = {
  isActive: boolean,
};

const defaultProps = {
  value: null,
  disabled: false,
};

const disabledClassName = 'disabled';
const selectedClassName = 'active';

class Select extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  constructor(props: Props, context: void) {
    super(props, context);
    this.value = props.value;
    this.prevValue = this.value;
    this.data = null;

    this.state = {
      isActive: false,
    };

    // binds ...
    const self: any = this;
    self.onClickToMe = this.onClickToMe.bind(this);
    self.onLeaveDropdown = this.onLeaveDropdown.bind(this);
    self.onChangeOption = this.onChangeOption.bind(this);
  }

  componentDidMount() {
    this.fireChangeIfNeeded();
  }

  componentDidUpdate() {
    this.fireChangeIfNeeded();
  }

  onClickToMe(event: SyntheticEvent<HTMLElement>) {
    event.stopPropagation();

    this.setState({
      isActive: true,
    });
  }

  onLeaveDropdown() {
    this.setState({
      isActive: false,
    });
  }

  onChangeOption(event: SyntheticEvent<HTMLElement>, value: string) {
    event.preventDefault();
    event.stopPropagation();
    this.prevValue = this.value;
    this.value = value;
    this.onLeaveDropdown();
  }

  fireChangeIfNeeded() {
    if (this.prevValue === this.value) {
      return;
    }

    this.prevValue = this.value;

    if (this.props.onChange) {
      this.props.onChange(this.value, this.data);
    }
  }

  value: ?string;
  prevValue: ?string;
  data: any;

  render() {
    const self = this;
    this.data = null;

    const {
      name,
      className,
      placeholder,
    } = self.props;

    let content = null;
    const options = React.Children.toArray(self.props.children);

    if (placeholder) {
      options.splice(0, 0, (
        <Option disabled>{placeholder}</Option>
      ));
    }

    const dropdownItemsProps = [];

    options.forEach((option) => {
      if (option.type.displayName !== itemDisplayName) {
        return;
      }

      const itemProps = option.props;

      if (typeof itemProps === 'object' && itemProps !== null) {
        const {
          children,
          value,
          data,
          disabled,
        } = itemProps;

        const rValue = value || children;

        const dropdownItemProps: { [string]: any } = {
          children,
          className: itemDisplayName,
          value: rValue,
        };

        if (disabled) {
          dropdownItemProps.className += ` ${disabledClassName}`;
        } else {
          dropdownItemProps.data = rValue;
          dropdownItemProps.rData = data;
          dropdownItemProps.onClick = self.onChangeOption;
        }

        if (this.value === rValue) {
          this.data = data;
          dropdownItemProps.className += ` ${selectedClassName}`;
        }

        dropdownItemsProps.push(dropdownItemProps);
      }
    });

    if (this.value === null) {
      const firstItem = dropdownItemsProps[0];

      if (firstItem) {
        firstItem.className += ` ${selectedClassName}`;
        this.prevValue = this.value;
        this.value = firstItem.value;
        this.data = firstItem.data;
      }
    }

    const selfProps: { [string]: any } = {
      className: 'Select form-control',
      onClick: this.onClickToMe,
    };

    let caret = '▼';

    if (self.state.isActive) {
      selfProps.className += ' active';
      caret = '▲';

      content = (
        <Dropdown
          leftSticky
          className="select-dropdown"
          onMouseLeave={self.onLeaveDropdown}
        >
          {dropdownItemsProps.map((ddProp, idx) => {
            const key = `ptn_${idx}`;

            return (
              <DropdownItem
                {...ddProp}
                key={key}
              >
                {ddProp.children}
              </DropdownItem>
            );
          })}
        </Dropdown>
      );
    }

    const inputAttrs: { [string]: any } = {
      name,
      type: 'text',
      readOnly: true,
      value: this.value,
    };

    if (self.props.disabled) {
      delete selfProps.onClick;
      selfProps.className += ` ${disabledClassName}`;
      inputAttrs.disabled = true;
    }

    if (className) {
      selfProps.className += ` ${className}`;
    }

    return (
      <div {...selfProps}>
        <input {...inputAttrs} />
        <span className="caret">{caret}</span>
        {content}
      </div>
    );
  }
}

export { Option };
export default Select;
