// @flow
const users = require('../api/users');
const csrf = require('../api/csrf');

const getUnknownError = () => new Error('unknown error');

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
      next(new Error('You are not logged'));
      return;
    }

    next();
  }).catch(() => {
    next(getUnknownError());
  });
};

Middleware = {};

Middleware.checkPassword = (req, res, next) => {
  users.checkPassword(req.userId, req.body.currPassword).then(() => {
    next();
  }).catch(next);
};

Middleware.clientIp = (req, res, next) => {
  req.clientIp = req.ip.replace(/^.*:/, '');
  next();
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
      next(new Error('You have already logged in'));
      return;
    }

    next();
  }).catch(() => {
    next(getUnknownError());
  });
};

Middleware.session = (req, res, next) => {
  GSession.forRequest(req, res).then(next).catch(() => {
    next(getUnknownError());
  });
};

Middleware.userId_Sess = (req, res, next) => {
  applyUserId(req, res, next);
};

Middleware.admin_Sess = (req, res, next) => {
  applyUserId(req, res, () => {
    const isAdmin = req.session.get(Enums.SESS_USER_IS_ADMIN);

    if (!isAdmin) {
      next(new Error('Only for administrator'));
      return;
    }

    next();
  });
};

Middleware.csrf_Sess = (req, res, next) => {
  GSession.forRequest(req, res).then(() => {
    const csrfToken = req.headers[csrf.cookieName];
    const csrfSecret = req.session.get(csrf.secretKey);

    if (!csrf.compare(csrfSecret, csrfToken)) {
      next(new Error('csrf token is incorrect'));
      return;
    }

    next();
  }).catch(() => {
    next(getUnknownError());
  });
};

Middleware.user_Sess = (req, res, next) => {
  applyUserId(req, res, () => {
    users.getById(req.userId).then((user) => {
      req.user = user;

      if (!user) {
        next(new Error('User not found'));
        return;
      }

      next();
    }).catch(() => {
      next(getUnknownError());
    });
  });
};
