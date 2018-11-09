// @flow
const tools = require('./tools');

const ROLE = {
  ADMIN: 'ADMIN',
  USER: 'USER',
};

const userRoles = {
  TYPE: ROLE,

  exists: (role: string) => tools.has.call(ROLE, role),

  check(role: string) {
    if (!this.exists(role)) {
      throw new Error(`Role "${role}" not exists`);
    }
  },
};

module.exports = userRoles;
