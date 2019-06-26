// @flow
const competition = require('../api/competition');

module.exports = function competitionRoute() {
  this.get('/competition-members', (req, res, next) => {
    competition.getMembers().then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.delete('/competition-members', (req, res, next) => {
    competition.deleteMembers().then(() => {
      res.end();
    }).catch(next);
  });

  this.post('/competition-members', Middleware.admin_Sess, (req, res, next) => {
    competition.generateMembers().then((items) => {
      res.json(items);
    }).catch(next);
  });
};
