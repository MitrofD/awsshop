// @flow
import React from 'react';
import { Route, Switch } from 'react-router-dom';
import StaticPage from './StaticPage';

const {
  Loadable,
  LoadableIfUserNeeded,
  LoadableIfAdmin,
  LoadableWithParams,
} = require('../components/Loadable').default(cN => import(`./${cN}`));

const AdminPage = LoadableIfAdmin('Admin');
const CatalogPage = LoadableWithParams('Catalog');
const EmailVerificationSendedPage = LoadableWithParams('EmailVerificationResent');
const EmailVerificationPage = LoadableWithParams('EmailVerification');
const DashboardPage = LoadableIfUserNeeded('Dashboard', true);
const HomePage = Loadable('Home');
const FAQPage = Loadable('FAQ');
const ForgotPasswordPage = LoadableIfUserNeeded('ForgotPassword', false);
const FindPasswordTipPage = Loadable('FindPasswordTip');
const LoginPage = LoadableIfUserNeeded('Login', false);
const OrdersCompletedPage = LoadableWithParams('OrdersCompleted');
const RegistrationPage = LoadableIfUserNeeded('Registration', false);
const ResetPasswordPage = LoadableWithParams('ResetPassword');
const ProductPage = LoadableWithParams('Product');
const SettingsPage = LoadableIfUserNeeded('Settings', true);
const ShoppingCartPage = LoadableIfUserNeeded('ShoppingCart', true);
const SupportPage = Loadable('Support');

const Routes = () => (
  <Switch>
    <Route
      component={HomePage}
      exact
      path="/"
    />
    <Route
      component={CatalogPage}
      path="/catalog"
    />
    <Route
      component={CatalogPage}
      path={`${Config.categoryPath}:category`}
    />
    <Route
      component={DashboardPage}
      path={Config.dashboardPath}
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
      path="/create-shop"
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
      component={FAQPage}
      path="/faq"
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
      component={SettingsPage}
      path={Config.settingsPath}
    />
    <Route
      component={ProductPage}
      path="/product/:id"
    />
    <Route
      component={ShoppingCartPage}
      path="/shopping-cart"
    />
    <Route
      component={SupportPage}
      path="/support"
    />
    <Route
      path="/s/:path"
      render={({ match, history }) => (
        <StaticPage
          history={history}
          path={match.params.path}
        />
      )}
    />
    <Route
      component={OrdersCompletedPage}
      path="/orders-completed/:code"
    />
  </Switch>
);

export default Routes;
