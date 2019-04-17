// @flow
const support = require('../api/support');

module.exports = function supportRoute() {
  this.delete('/support/subjects/:itemId', Middleware.admin_Sess, (req, res, next) => {
    support.deleteSubject(req.params.itemId).then((item) => {
      res.json(item);
    }).catch(next);
  });

  this.get('/support/messages', (req, res, next) => {
    support.getMessages(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.get('/support/subjects', (req, res, next) => {
    support.getSubjects(req.query).then((items) => {
      res.json(items);
    }).catch(next);
  });

  this.post('/support/messages', Middleware.jsonBodyParser, (req, res, next) => {
    support.addMessage(req.body).then((id) => {
      res.json(id);
    }).catch(next);
  });

  this.post('/support/subjects', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    support.addSubject(req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/support/messages/answer/:id', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    support.answerToMessage(req.params.id, req.body.answer).then((data) => {
      res.json(data);
    }).catch(next);
  });

  this.put('/support/subjects/:itemId', Middleware.admin_Sess, Middleware.jsonBodyParser, (req, res, next) => {
    support.updateSubject(req.params.itemId, req.body).then((data) => {
      res.json(data);
    }).catch(next);
  });
};
