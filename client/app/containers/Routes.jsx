// @flow
import React from 'react';
import { Route, Switch } from 'react-router-dom';

const {
  Loadable,
  LoadableIfUserNeeded,
  LoadableIfAdmin,
  LoadableWithParams,
} = require('../components/Loadable')(cN => import(`./${cN}`));

const AdminPage = LoadableIfAdmin('Admin');
const CatalogPage = Loadable('Catalog');
const LoginPage = LoadableIfUserNeeded('Login', false);
const RegistrationPage = LoadableIfUserNeeded('Registration', false);
const EmailVerificationSendedPage = LoadableWithParams('EmailVerificationResent');
const EmailVerificationPage = LoadableWithParams('EmailVerification');
const ForgotPasswordPage = LoadableIfUserNeeded('ForgotPassword', false);
const FindPasswordTipPage = Loadable('FindPasswordTip');
const ResetPasswordPage = LoadableWithParams('ResetPassword');
const ShippingAndPayment = Loadable('ShippingAndPayment');
const Warranty = Loadable('Warranty');

/*
const AccountCenterPage = LoadableIfUserNeeded('AccountCenter', true);

const CatalogPage = Loadable('Catalog');
const DisableAccountSuccessPage = Loadable('DisableAccountSuccess');
const ForgotPasswordPage = Loadable('ForgotPassword');
const FindPasswordTipPage = Loadable('FindPasswordTip');
const RegistrationPage = Loadable('Registration');
const ResentReactivateAccount = Loadable('ResentReactivateAccount');
const WantReactivateAccount = Loadable('WantReactivateAccount');

const AccountVerificationPage = LoadableWithParams('AccountVerification');
const DisableAccountPage = LoadableWithParams('DisableAccount');
const EmailVerificationSendedPage = LoadableWithParams('EmailVerificationResent');
const EmailVerificationResentPage = LoadableWithParams('EmailVerificationResent', {
  advancedMessage: 'Your account is not activated yet',
});

const ForgotSecurityResentPage = LoadableWithParams('ForgotSecurityResent');
const ResetPasswordPage = LoadableWithParams('ResetPassword');
const ReactivateAccountPage = LoadableWithParams('ReactivateAccount');
*/

const Routes = () => (
  <Switch>
    <Route
      component={CatalogPage}
      exact
      path="/"
    />
    <Route
      component={AdminPage}
      path={Config.adminPath}
    />
    <Route
      component={LoginPage}
      path="/login"
    />
    <Route
      component={RegistrationPage}
      path="/registration"
    />
    <Route
      component={EmailVerificationSendedPage}
      path="/email-verification-sended/:email"
    />
    <Route
      component={EmailVerificationPage}
      path="/email-verification/:verificationCode"
    />
    <Route
      component={ForgotPasswordPage}
      path="/forgot-password"
    />
    <Route
      component={FindPasswordTipPage}
      path="/find-pwd-tip"
    />
    <Route
      component={ResetPasswordPage}
      path="/reset-password/:verificationCode"
    />
    <Route
      component={ShippingAndPayment}
      path="/shipping-and-payment"
    />
    <Route
      component={Warranty}
      path="/warranty"
    />
  </Switch>
);

/*
class Routes extends React.PureComponent<Props> {
  componentDidMount() {
    this.logoutSubs = userWS.subscribe('LOGOUT', () => {
      user.logout(true);
      this.props.history.push('/login');
    });
  }

  componentWillUnmount() {
    if (this.logoutSubs) {
      this.logoutSubs.stop();
    }
  }

  logoutSubs: ?SubscribeHandler = null;

  render() {
    return (
      <Switch>
        <Route
          component={CatalogPage}
          exact
          path="/"
        />
        <Route
          component={AccountCenterPage}
          path={Config.accountCenterPath}
        />
        <Route
          component={AccountCenterPage}
          path={`${Config.accountCenterPath}/settings`}
        />
        <Route
          component={AccountVerificationPage}
          path="/account-verification/:verificationCode"
        />
        <Route
          component={DisableAccountPage}
          path="/disable-account/:verificationCode"
        />
        <Route
          component={DisableAccountSuccessPage}
          path="/disable-account-success"
        />
        <Route
          component={EmailVerificationSendedPage}
          path="/email-verification-sended/:email"
        />
        <Route
          component={FindPasswordTipPage}
          path="/find-pwd-tip"
        />
        <Route
          component={ForgotSecurityResentPage}
          path="/forgot-security/:type"
        />
        <Route
          component={ForgotPasswordPage}
          path="/forgot-password"
        />
        <Route
          component={LoginPage}
          path="/login"
        />
        <Route
          path="/trade/:pair"
          render={(routeProps) => {
            const routeMatch = routeProps.match;
            return <Trade {...routeMatch.params} />;
          }}
        />
        <Route
          component={ReactivateAccountPage}
          path="/reset-security/:type/:verificationCode"
        />
        <Route
          component={ReactivateAccountPage}
          path="/reactivate-account/:verificationCode"
        />
        <Route
          component={ResentReactivateAccount}
          path="/resent-reactivate-account"
        />
        <Route
          component={RegistrationPage}
          path="/registration"
        />
        <Route
          component={EmailVerificationResentPage}
          path="/resend-email/:email"
        />
        <Route
          component={ResetPasswordPage}
          path="/reset-password/:verificationCode"
        />
        <Route
          component={WantReactivateAccount}
          path="/want-reactivate-account"
        />
      </Switch>
    );
  }
}
*/

export default Routes;
