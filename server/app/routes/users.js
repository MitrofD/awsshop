// @flow
const users = require('../api/users');
const userRoles = require('../api/user-roles');

const verificationMiddleware = (req, res, next) => {
  const parts = req.body.verificationCode.split(':');
  req.verification = {
    id: parts[0],
    code: parts[1],
  };

  next();
};

const sendVerificationMessageToEmail = async (email: string): Promise<boolean> => {
  const user = await users.getByEmail(email);

  if (!user) {
    throw new Error('This email not registered');
  }

  if (!user.verification) {
    throw new Error('Your email is already verified');
  }

  return Mailer.sendTo(email, {
    subject: 'Confirm your registration',
    template: 'registration',
    data: user,
  });
};

const hourInMs = 3600000;
const maxLoginAttempts = 5;
const sessLoginAttemptsNum = 'loginAttemptsNum';
const sessLoginTime = 'loginTime';

module.exports = function usersRoute() {
  this.post('/emailVerification', Middleware.jsonBodyParser, verificationMiddleware, (req, res, next) => {
    users.verification(req.verification.id, req.verification.code).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });

  this.post('/forgotPassword', Middleware.jsonBodyParser, (req, res, next) => {
    users.forgotPassword(req.body.email).then((user) => {
      if (user) {
        Mailer.sendTo(user.email, {
          data: user,
          subject: 'Password Reset',
          template: 'reset-password',
        }).then(() => {
          res.json(Tools.okObj);
        }).catch(() => {
          next(Tools.sendEmailError);
        });
        return;
      }

      res.json(Tools.okObj);
    }).catch(next);
  });

  this.post('/login', Middleware.onlyNotAuth_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    const nowTime = Date.now();
    const retryHours = 2;
    const retryLoginTimeoutMs = hourInMs * retryHours;
    const lastLoginTime = req.session.get(sessLoginTime) || nowTime;
    let loginAttemtsNum = parseInt(req.session.get(sessLoginAttemptsNum)) || 0;

    if ((nowTime - lastLoginTime) > retryLoginTimeoutMs) {
      loginAttemtsNum = 0;
    }

    const remLoginAttempts = maxLoginAttempts - loginAttemtsNum;

    if (remLoginAttempts < 1) {
      const tooManyError = new Error(`Too many invalid login attemps, please retry ${retryHours} hours later`);
      next(tooManyError);
      return;
    }

    req.session.set(sessLoginTime, nowTime);

    users.login(req.body.email, req.body.password).then((user) => {
      const userId = user._id.toString();
      const safeUser = users.getSafeUser(user);

      if (!safeUser.isVerified) {
        res.json(safeUser);
        return;
      }

      req.session.set(Enums.SESS_USER_EMAIL, user.email);
      req.session.set(Enums.SESS_USER_ROLE, user.role);
      req.session.set(Enums.SESS_USER_ID, userId);
      res.json(safeUser);
    }).catch((error) => {
      req.session.set(sessLoginAttemptsNum, loginAttemtsNum + 1);

      if (remLoginAttempts <= 3) {
        const triesLeftError = new Error(error.message + `, you have ${remLoginAttempts} tries left`);
        next(triesLeftError);
      } else {
        next(error);
      }
    });
  });

  this.post('/logout', Middleware.userId_Sess, (req, res) => {
    req.session.reset([
      sessLoginAttemptsNum,
      sessLoginTime,
    ]);

    res.json(Tools.okObj);
  });

  this.post('/resetPassword', Middleware.jsonBodyParser, verificationMiddleware, (req, res, next) => {
    users.resetPassword(req.verification.id, req.verification.code, req.body.password).then((user) => {
      if (user) {
        Mailer.sendTo(user.email, {
          data: {
            ...user,
            confirmTTLMin: users.confirmTTLMin,
          },
          subject: 'Password changed',
          template: 'password-changed',
        }).then(() => {
          res.json(Tools.okObj);
        }).catch(() => {
          next(Tools.sendEmailError);
        });
        return;
      }

      res.json(Tools.okObj);
    }, next);
  });

  this.post('/registration', Middleware.onlyNotAuth_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    users.has().then((hasUser) => {
      const role = hasUser ? userRoles.TYPE.USER : userRoles.TYPE.ADMIN;

      users.registration(role, req.body.email, req.body.password, req.body.ethAddress).then((answer) => {
        if (answer.data) {
          sendVerificationMessageToEmail(answer.data.email).catch(Tools.emptyRejectExeption);
        }

        res.json(answer);
      }).catch(next);
    }).catch(next);
  });

  this.post('/resentRegisterMail', Middleware.jsonBodyParser, (req, res, next) => {
    sendVerificationMessageToEmail(req.body.email).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });

  this.post('/setPassword', Middleware.userId_Sess, Middleware.jsonBodyParser, Middleware.checkPassword, (req, res, next) => {
    users.setPassword(req.userId, req.body.newPassword).then(() => {
      res.json(Tools.okObj);
    }).catch(next);
  });

  this.get('/userInfo', Middleware.session, (req, res) => {
    const userId = req.session.get(Enums.SESS_USER_ID);

    if (userId) {
      users.getById(userId).then((user) => {
        if (!user) {
          res.json(null);
          return;
        }

        const safeUser = users.getSafeUser(user);
        res.json(safeUser);
      }).catch(() => {
        res.json(null);
      });
      return;
    }

    res.json(null);
  });
};
