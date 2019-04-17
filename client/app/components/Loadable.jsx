import React from 'react';
import { Redirect } from 'react-router-dom';
import FadingCircleSpin from './spins/FadingCircleSpin';
import user from '../api/user';

function load(loader) {
  const promise = loader();

  const state = {
    loading: true,
    loaded: null,
    error: null,
  };

  state.promise = promise.then((loaded) => {
    state.loading = false;
    state.loaded = loaded;
    return loaded;
  }, (error) => {
    state.loading = false;
    state.error = error;
    throw error;
  });

  return state;
}

function resolve(obj) {
  return obj && obj.__esModule ? obj.default : obj; // eslint-disable-line no-underscore-dangle
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props);
}

function clearTimeouts() {
  clearTimeout(this.delay);
  clearTimeout(this.timeout);
}

function createLoadableComponent(loadFn, options) {
  if (!options.loading) {
    throw new Error('Loadable requires a `loading` component');
  }

  const opts = Object.assign({
    render,
    loader: null,
    loading: null,
    delay: 200,
    timeout: null,
  }, options);

  let res = null;

  function init() {
    if (!res) {
      res = loadFn(opts.loader);
    }

    return res.promise;
  }

  return class LoadableComponent extends React.Component {
    constructor(props) {
      super(props);
      init();

      this.state = {
        error: res.error,
        pastDelay: false,
        timedOut: false,
        loading: res.loading,
        loaded: res.loaded,
      };
    }

    componentWillMount() {
      this.mounted = true;

      if (!res.loading) {
        return;
      }

      if (typeof opts.delay === 'number') {
        if (opts.delay === 0) {
          this.setState({ pastDelay: true });
        } else {
          this.delay = setTimeout(() => {
            this.setState({ pastDelay: true });
          }, opts.delay);
        }
      }

      if (typeof opts.timeout === 'number') {
        this.timeout = setTimeout(() => {
          this.setState({ timedOut: true });
        }, opts.timeout);
      }

      const update = () => {
        if (!this.mounted) {
          return;
        }

        this.setState({
          error: res.error,
          loaded: res.loaded,
          loading: res.loading,
        });

        clearTimeouts.call(this);
      };

      res.promise.then(() => {
        update();
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.log(error);
        update();
      });
    }

    componentWillUnmount() {
      this.mounted = false;
      clearTimeouts.call(this);
    }

    render() {
      if (this.state.loading || this.state.error) {
        return React.createElement(opts.loading, {
          isLoading: this.state.loading,
          pastDelay: this.state.pastDelay,
          timedOut: this.state.timedOut,
          error: this.state.error,
        });
      } else if (this.state.loaded) {
        return opts.render(this.state.loaded, this.props);
      }

      return null;
    }
  };
}

function LoadableFunc(opts) {
  return createLoadableComponent(load, opts);
}

export default (imp) => {
  const loadableDefData = (componentName) => {
    const rData = {
      loader: () => imp(componentName),
      loading: FadingCircleSpin,
    };

    return rData;
  };

  const Loadable = (componentName, advProps) => {
    const loadableOptions = loadableDefData(componentName);

    if (advProps) {
      loadableOptions.render = (loaded, props) => {
        const Component = loaded.default;
        Object.assign(props, advProps);

        return React.createElement(Component, props);
      };
    }

    return LoadableFunc(loadableOptions);
  };

  const LoadableWithParams = (componentName, advProps) => {
    const loadableOptions = loadableDefData(componentName);

    loadableOptions.render = (loaded, { match }) => {
      const Component = loaded.default;
      const commonProps = match.params;

      if (advProps) {
        Object.assign(commonProps, advProps);
      }

      return React.createElement(Component, commonProps);
    };

    return LoadableFunc(loadableOptions);
  };

  const LoadableIfUserNeeded = (componentName, needUserExists) => {
    const loadableOptions = loadableDefData(componentName);

    if (!needUserExists) {
      loadableOptions.render = (loaded) => {
        const userData = user.get();

        if (userData) {
          return <Redirect to="/" />;
        }

        return React.createElement(loaded.default, {}, null);
      };
    } else {
      loadableOptions.render = (loaded) => {
        const userData = user.get();
        return !userData ? <Redirect to="/login" /> : React.createElement(loaded.default, {}, null);
      };
    }

    return LoadableFunc(loadableOptions);
  };

  const LoadableIfAdmin = (componentName) => {
    const loadableOptions = loadableDefData(componentName);

    loadableOptions.render = (loaded) => {
      const currUser = user.get();

      if (!(currUser && currUser.isAdmin)) {
        return <Redirect to="/" />;
      }

      return React.createElement(loaded.default, {}, null);
    };

    return LoadableFunc(loadableOptions);
  };

  return {
    Loadable,
    LoadableIfAdmin,
    LoadableWithParams,
    LoadableIfUserNeeded,
  };
};
