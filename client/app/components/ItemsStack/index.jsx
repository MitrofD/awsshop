// @flow
import React from 'react';
import './style.scss';

type Props = {
  name?: string,
};

type Options = {
  duration: ?number,
  hoverPause: boolean,
  name: string,
  replace?: boolean,
};

const SEC_IN_MS = 1000;
const showDuration = SEC_IN_MS * 5;

const genUniqueName = (function uniqueNameGen() {
  let idx = 0;

  return (prfx: string) => {
    idx += 1;
    return prfx + idx;
  };
}());

const getPureOptions = (options?: Object): Options => {
  const pureOptions = {
    duration: showDuration,
    hoverPause: true,
    name: genUniqueName('itm'),
  };

  if (typeof options === 'object' && options !== null) {
    return Object.assign({}, pureOptions, options);
  }

  return pureOptions;
};

const defaultProps = {
  name: genUniqueName('stck'),
};

class ItemsStack extends React.PureComponent<Props> {
  static defaultProps = defaultProps;

  static allStacks: { [string]: ItemsStack } = {};

  static get(stackName: string): ItemsStack {
    const stack = ItemsStack.allStacks[stackName];
    return stack;
  }

  items: { [string]: React$Node } = {};

  itemTimers: { [string]: TimeoutID } = {};

  name: string;

  constructor(props: Props, context: null) {
    super(props, context);
    const pureName = typeof props.name === 'string' ? props.name.trim() : '';
    this.name = pureName.length > 0 ? pureName : genUniqueName('stck');
    ItemsStack.allStacks[this.name] = this;
  }

  componentWillUnmount() {
    this.stopItemTimers();
    delete ItemsStack.allStacks[this.name];
  }

  add(rNode: React$Node, options?: Object) {
    const pureOptions = getPureOptions(options);
    const itemName = pureOptions.name;

    if (pureOptions.replace) {
      this.reset();
    }

    this.stopItemTimer(itemName);

    const elProps = {};

    if (pureOptions.duration) {
      const closeDuration = pureOptions.duration;

      const runCloseTimer = () => {
        const closeTimer = setTimeout(() => {
          this.remove(itemName);
        }, closeDuration);

        return closeTimer;
      };

      this.itemTimers[itemName] = runCloseTimer();

      if (pureOptions.hoverPause) {
        elProps.onMouseLeave = () => {
          this.itemTimers[itemName] = runCloseTimer();
        };

        elProps.onMouseOver = () => {
          this.stopItemTimer(itemName);
        };
      }
    }

    const pureItem = (
      <div
        {...elProps}
        className="item"
        key={itemName}
      >
        {rNode}
      </div>
    );

    this.items[itemName] = pureItem;
    this.forceUpdate();

    return {
      remove() {
        this.remove(itemName);
      },
    };
  }

  remove(itemName: string) {
    delete this.items[itemName];
    this.stopItemTimer(itemName);
    this.forceUpdate();
  }

  reset(forceUpdate: boolean = false) {
    this.stopItemTimers();
    this.items = {};

    if (forceUpdate) {
      this.forceUpdate();
    }
  }

  stopItemTimer(itemName: string) {
    const timer = this.itemTimers[itemName];

    if (timer) {
      clearTimeout(timer);
      delete this.itemTimers[itemName];
    }
  }

  stopItemTimers() {
    const itemNames = Object.keys(this.itemTimers);

    itemNames.forEach((itemName) => {
      const timer = this.itemTimers[itemName];
      clearTimeout(timer);
    });

    this.itemTimers = {};
  }

  render() {
    const allItems: React$Node[] = (Object.values(this.items): any);

    return (
      <div className="ItemsStack">
        {allItems}
      </div>
    );
  }
}

export default ItemsStack;
