// @flow
const users = require('../api/users');
const userRoles = require('../api/user-roles');

const bodyParser = (req, callback) => {
  let body = '';

  if (req.method === 'GET') {
    callback(body);
  }

  req.on('data', (chunk) => {
    body += String(chunk);
  });

  req.on('end', () => {
    callback(body);
  });
};

const applyUserId = (req: Object, res: Object, next: Function) => {
  GSession.forRequest(req, res).then(() => {
    req.userId = req.session.get(Enums.SESS_USER_ID);

    if (!req.userId) {
      const notLoggedError = new Error('You are not logged');
      next(notLoggedError);
      return;
    }

    next();
  });
};

Middleware = {};

Middleware.checkPassword = (req, res, next) => {
  users.checkPassword(req.userId, req.body.password).then(() => {
    next();
  }).catch(next);
};

Middleware.jsonBodyParser = (req, res, next) => {
  bodyParser(req, (bodyString) => {
    try {
      req.body = JSON.parse(bodyString);
    } catch (error) {
      req.body = {};
    }

    next();
  });
};

Middleware.onlyNotAuth_Sess = (req, res, next) => {
  GSession.forRequest(req, res).then(() => {
    if (req.session.get(Enums.SESS_USER_ID)) {
      const alreadyLoggeError = new Error('You have already logged in');
      next(alreadyLoggeError);
      return;
    }

    next();
  });
};

Middleware.session = (req, res, next) => {
  GSession.forRequest(req, res).then(next);
};

Middleware.userId_Sess = (req, res, next) => {
  applyUserId(req, res, next);
};

Middleware.admin_Sess = (req, res, next) => {
  applyUserId(req, res, () => {
    const role = req.session.get(Enums.SESS_USER_ROLE);

    if (role !== userRoles.TYPE.ADMIN) {
      const error = new Error('Only for administrator');
      next(error);
      return;
    }

    next();
  });
};

Middleware.user_Sess = (req, res, next) => {
  applyUserId(req, res, () => {
    users.getById(req.userId).then((user) => {
      req.user = user;

      if (!user) {
        const notFoundUserError = new Error('User not found');
        next(notFoundUserError);
        return;
      }

      next();
    }).catch(() => {
      const unknownError = new Error('Unknown error');
      next(unknownError);
    });
  });
};
