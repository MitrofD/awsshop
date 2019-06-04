// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import AlertWarning from '../../components/alerts/AlertWarning';
import user from '../../api/user';

type AlertsArr = React$Element<typeof AlertWarning>[];

type Props = {
  user?: ?Object,
};

type State = {
  alerts: AlertsArr,
};

const defaultProps = {
  user: null,
};

const getUserAlerts = (cUser: ?Object) => {
  const retAlerts: AlertsArr = [];

  if (cUser) {
    const {
      pMWallet,
    } = cUser;

    if (!pMWallet) {
      const pMWalletAlert = (
        <AlertWarning key="pMWallet">
          Для возможности получения партнерских отчислений нужно заполнить
          <Link to={`${Config.settingsPath}/perfect-money`}> платежные данные</Link>
        </AlertWarning>
      );

      retAlerts.push(pMWalletAlert);
    }
  }

  return retAlerts;
};

class UserAlerts extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

  unmounted = true;

  userHandle: ?SubscribeHandler = null;

  constructor(props: Props, context: null) {
    super(props, context);

    this.state = {
      alerts: getUserAlerts(props.user),
    };
  }

  componentDidMount() {
    this.unmounted = false;

    this.userHandle = user.subscribe((cUser: ?Object) => {
      if (this.unmounted) {
        return;
      }

      this.setState({
        alerts: getUserAlerts(cUser),
      });
    });
  }

  componentWillUnmount() {
    this.unmounted = true;

    if (this.userHandle) {
      this.userHandle.stop();
      this.userHandle = null;
    }
  }

  render() {
    const {
      alerts,
    } = this.state;

    if (alerts.length === 0) {
      return null;
    }

    return <div className="UserAlerts text-center text-light">{alerts}</div>;
  }
}

export default UserAlerts;
