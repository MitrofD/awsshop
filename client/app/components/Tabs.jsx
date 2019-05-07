// @flow
import React, { Fragment } from 'react';

const tabName = 'Tab';

type ItemProps = {
  children: React$Node,
  component: ?Function,
  render: () => React$Node,
};

const tabDefaultProps = {
  component: null,
  render: () => null,
};

const Tab = (props: ItemProps) => props.children;

Tab.defaultProps = tabDefaultProps;
Tab.displayName = tabName;

// type ReactNodeOrReactNodeCollection = React$Node | React$Node[];

type Props = {
  children: React$Node,
  activeIndex?: number,
  className?: ?string,
  // eslint-disable-next-line react/no-unused-prop-types
  onChange?: ?Function,
};

type State = {
  activeIndex: number,
};

const defaultProps = {
  className: null,
  activeIndex: 0,
  onChange: null,
};

const didChange = function ddChng() {
  if (this.oldIndex === this.state.activeIndex) {
    return;
  }

  this.oldIndex = this.state.activeIndex;

  if (this.props.onChange) {
    this.props.onChange(this);
  }
};

class Tabs extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  oldIndex: number;

  constructor(props: Props, context: void) {
    super(props, context);
    const activeIndex = parseInt(props.activeIndex);
    this.oldIndex = activeIndex;

    this.state = {
      activeIndex,
    };

    const self: any = this;
    self.onClickToItem = this.onClickToItem.bind(this);
  }

  componentDidMount() {
    didChange.call(this);
  }

  componentDidUpdate() {
    didChange.call(this);
  }

  onClickToItem(event: SyntheticEvent<HTMLElement>) {
    event.preventDefault();
    const item = event.currentTarget;
    const activeIndex = parseInt(item.dataset.idx) || 0;

    if (this.state.activeIndex === activeIndex) {
      return;
    }

    this.setState({
      activeIndex,
    });
  }

  getIndex() {
    return this.state.activeIndex;
  }

  getMaxIndex() {
    return Math.max(React.Children.count(this.props.children) - 1, 0);
  }

  setIndex(index: number): boolean {
    const idxAsInt = parseInt(index);
    const maxIndex = this.getMaxIndex();

    if (index < 0 || index > maxIndex) {
      return false;
    }

    this.setState({
      activeIndex: idxAsInt,
    });

    return true;
  }

  nextTab(): boolean {
    return this.setIndex(this.getIndex() + 1);
  }

  prevTab(): boolean {
    return this.setIndex(this.getIndex() - 1);
  }

  isFirstTab(): boolean {
    return this.getIndex() === 0;
  }

  isLastTab(): boolean {
    return this.getIndex() === this.getMaxIndex();
  }

  render() {
    const listChildren = [];
    const currIdx = this.state.activeIndex;
    let contentData = null;

    React.Children.forEach(this.props.children, (item, idx) => {
      if (item.type.displayName !== tabName) {
        return;
      }

      let itemLinkClassName = 'nav-link';

      if (idx === currIdx) {
        itemLinkClassName += ' active';
        const Component = item.props.component;
        contentData = Component ? <Component /> : item.props.render();
      }

      const key = `tb_${idx}`;

      const childrenEl = (
        <li
          key={key}
          className="nav-item"
        >
          <a
            href="#"
            data-idx={idx}
            className={itemLinkClassName}
            onClick={this.onClickToItem}
          >
            {item}
          </a>
        </li>
      );

      listChildren.push(childrenEl);
    });

    const ulClassName = `Tabs tabs nav ${this.props.className || 'nav-tabs'}`;

    return (
      <Fragment>
        <ul className={ulClassName}>{listChildren}</ul>
        <div className="tab-content">{contentData}</div>
      </Fragment>
    );
  }
}

export { Tab };
export default Tabs;
