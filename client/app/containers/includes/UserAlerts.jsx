// @flow
import React from 'react';
import { Link } from 'react-router-dom';
import AlertDanger from '../../components/alerts/AlertDanger';
import user from '../../api/user';

type AlertsArr = React$Element<typeof AlertDanger>[];

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
        <AlertDanger key="pMWallet">
          Для возможности получения партнерских отчислений нужно заполнить
          <Link to={`${Config.settingsPath}/perfect-money`}> платежные данные</Link>
        </AlertDanger>
      );

      retAlerts.push(pMWalletAlert);
    }
  }

  return retAlerts;
};

class UserAlerts extends React.PureComponent<Props, State> {
  static defaultProps = defaultProps;

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

  unmounted = true;
  userHandle: ?SubscribeHandler = null;

  render() {
    const {
      alerts,
    } = this.state;

    if (alerts.length === 0) {
      return null;
    }

    return <div className="UserAlerts animated pulse">{alerts}</div>;
  }
}

export default UserAlerts;